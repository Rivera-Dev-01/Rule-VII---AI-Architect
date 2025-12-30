"""
RAG Engine Service
Handles vector search and document retrieval from Supabase.
"""

import logging
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from app.models.citation import SourceNode
from app.core.database import supabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Singleton service for text embeddings.
    Loads model once, reuses for all requests.
    """
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if EmbeddingService._model is None:
            logger.info("Loading embedding model...")
            EmbeddingService._model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info(f"Embedding model loaded (device: {EmbeddingService._model.device})")
    
    def embed(self, text: str) -> List[float]:
        """Convert text to embedding vector."""
        return EmbeddingService._model.encode(text).tolist()


class VectorSearchService:
    """
    Handles vector similarity search in Supabase.
    """
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
    
    async def search(
        self, 
        query: str, 
        top_k: int = 5,
        similarity_threshold: float = 0.3,
        document_types: Optional[List[str]] = None
    ) -> List[dict]:
        """
        Search for similar documents in Supabase.
        
        Args:
            query: The search query
            top_k: Number of results to return
            similarity_threshold: Minimum similarity score
            document_types: Optional list of document types to filter by
            
        Returns:
            List of matching documents with similarity scores
        """
        try:
            # 1. Embed the query
            query_embedding = self.embedding_service.embed(query)
            
            # 2. Search in Supabase using RPC function
            # Use filtered search if document_types specified
            if document_types:
                result = supabase.rpc(
                    "search_documents_filtered",
                    {
                        "query_embedding": query_embedding,
                        "match_count": top_k,
                        "doc_types": document_types
                    }
                ).execute()
            else:
                result = supabase.rpc(
                    "search_documents",
                    {
                        "query_embedding": query_embedding,
                        "match_count": top_k
                    }
                ).execute()
            
            if not result.data:
                logger.debug(f"No results found for query: {query[:50]}...")
                return []
            
            # 3. Filter by similarity threshold
            filtered = [
                doc for doc in result.data 
                if doc.get('similarity', 0) >= similarity_threshold
            ]
            
            if settings.DEBUG:
                logger.debug(f"Found {len(filtered)} documents above threshold {similarity_threshold}")
            
            return filtered
            
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []


class RAGEngine:
    """
    Main RAG service that combines embedding and search.
    Used by the chat endpoint to provide context.
    """
    
    # Comprehensive mode configuration
    MODE_CONFIG = {
        "quick_answer": {
            "top_k": 3,           # Fewer docs for faster, surface-level responses
            "doc_types": None,    # Search all documents
            "temperature": 0.3,   # More focused/deterministic
        },
        "plan_draft": {
            "top_k": 5,
            "doc_types": ["statutory", "procedural", "specialized_planning"],
            "temperature": 0.4,
        },
        "compliance": {
            "top_k": 8,           # More docs for thorough analysis
            "doc_types": ["statutory", "heuristics"],
            "temperature": 0.5,   # Allow more reasoning
        }
    }
    
    @classmethod
    def get_mode_config(cls, mode: str) -> dict:
        """Get configuration for a specific mode."""
        return cls.MODE_CONFIG.get(mode, cls.MODE_CONFIG["quick_answer"])
    
    def __init__(self):
        self.search_service = VectorSearchService()
    
    async def retrieve(
        self, 
        query: str, 
        user_id: str,
        mode: str = "quick_answer"
    ) -> List[SourceNode]:
        """
        Retrieve relevant documents for a query.
        
        Args:
            query: User's question
            user_id: User ID (for future user-specific retrieval)
            mode: Chat mode (quick_answer, plan_draft, compliance)
            
        Returns:
            List of SourceNode citations
        """
        try:
            # Get mode-specific configuration
            config = self.get_mode_config(mode)
            top_k = config["top_k"]
            doc_types = config["doc_types"]
            
            if settings.DEBUG:
                logger.debug(f"RAG mode: {mode}, top_k: {top_k}, doc_types: {doc_types}")
            
            # Search for similar documents (filtering handled by search service)
            results = await self.search_service.search(query, top_k=top_k, document_types=doc_types)
            
            if not results:
                return []
            
            # Convert to SourceNode format
            sources = []
            for doc in results:
                # Parse source info from the document
                content = doc.get('content', '')
                source_file = doc.get('source', 'Unknown')
                similarity = doc.get('similarity', 0.0)
                
                # Try to extract section from content metadata
                section = self._extract_section(content)
                
                sources.append(SourceNode(
                    document=source_file,
                    page=doc.get('chunk_index', 0),  # Use chunk index as page
                    section=section,
                    similarity=round(similarity, 3)
                ))
            
            if settings.DEBUG:
                logger.debug(f"Retrieved {len(sources)} sources for query: {query[:50]}...")
            
            return sources
            
        except Exception as e:
            logger.error(f"RAG retrieval failed: {e}")
            return []
    
    async def get_context(
        self, 
        query: str, 
        user_id: str,
        mode: str = "quick_answer"
    ) -> str:
        """
        Get formatted context string for LLM.
        
        Args:
            query: User's question
            user_id: User ID
            mode: Chat mode for configuration
            
        Returns:
            Formatted context string with sources
        """
        try:
            # Use mode-specific configuration
            config = self.get_mode_config(mode)
            top_k = config["top_k"]
            doc_types = config["doc_types"]
            
            results = await self.search_service.search(query, top_k=top_k, document_types=doc_types)
            
            if not results:
                return ""
            
            # Format context with source attribution
            context_parts = []
            for doc in results:
                content = doc.get('content', '')
                source = doc.get('source', 'Unknown')
                context_parts.append(f"[Source: {source}]\n{content}")
            
            return "\n\n---\n\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Failed to get context: {e}")
            return ""
    
    def _extract_section(self, content: str) -> str:
        """Extract section reference from chunk content."""
        import re
        
        # Look for section patterns in the content
        patterns = [
            r'\[Reference:\s*([^\]]+)\]',
            r'Section\s+(\d+[\.\d]*)',
            r'SECTION\s+(\d+[\.\d]*)',
            r'Article\s+(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return "General Provisions"