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
            "top_k": 4,                    # Increased to provide richer context
            "doc_types": None,             # Search all documents
            "temperature": 0.3,            # More focused/deterministic
            "similarity_threshold": 0.35,  # Slightly stricter for quality
        },
        "plan_draft": {
            "top_k": 5,
            "doc_types": ["statutory", "procedural", "specialized_planning"],
            "temperature": 0.4,
            "similarity_threshold": 0.35,
        },
        "compliance": {
            "top_k": 6,                    # Reduced from 8 (less noise)
            "doc_types": None,             # Search all core laws
            "temperature": 0.4,            # Reduced from 0.5 (more focused)
            "similarity_threshold": 0.4,   # Stricter (quality over quantity)
        },
        "deep_thinking": {
            "top_k": 10,                   # More docs for comprehensive analysis
            "doc_types": None,             # Will include expanded dataset later
            "temperature": 0.5,            # Allow reasoning
            "similarity_threshold": 0.35,
        }
    }
    
    # Law Router - Maps keywords/intents to prioritized law codes
    LAW_ROUTING_RULES = {
        # Fire safety keywords -> RA 9514
        "fire": ["RA_9514", "RA 9514"],
        "fire exit": ["RA_9514", "RA 9514"],
        "fire code": ["RA_9514", "RA 9514"],
        "fire safety": ["RA_9514", "RA 9514"],
        "sprinkler": ["RA_9514", "RA 9514"],
        "smoke detector": ["RA_9514", "RA 9514"],
        "fire alarm": ["RA_9514", "RA 9514"],
        "fire extinguisher": ["RA_9514", "RA 9514"],
        "emergency exit": ["RA_9514", "RA 9514"],
        "egress": ["RA_9514", "RA 9514"],
        
        # Accessibility keywords -> BP 344
        "accessibility": ["BP_344", "BP 344"],
        "accessible": ["BP_344", "BP 344"],
        "pwd": ["BP_344", "BP 344"],
        "wheelchair": ["BP_344", "BP 344"],
        "ramp": ["BP_344", "BP 344"],
        "handrail": ["BP_344", "BP 344"],
        "disability": ["BP_344", "BP 344"],
        "disabled": ["BP_344", "BP 344"],
        
        # Building code keywords -> PD 1096
        "building permit": ["PD_1096", "PD 1096"],
        "building code": ["PD_1096", "PD 1096"],
        "national building code": ["PD_1096", "PD 1096"],
        "nbc": ["PD_1096", "PD 1096"],
        "occupancy": ["PD_1096", "PD 1096"],
        "floor area": ["PD_1096", "PD 1096"],
        "setback": ["PD_1096", "PD 1096"],
        "lot coverage": ["PD_1096", "PD 1096"],
        
        # Green building -> Philippine Green Building Code
        "green building": ["PGBC"],
        "sustainable": ["PGBC"],
        "energy efficiency": ["PGBC"],
        "leed": ["PGBC"],
        
        # Housing -> BP 220
        "socialized housing": ["BP_220", "BP 220", "RA 7279", "JMC 2025-001", "JMC 2023-003"],
        "low cost housing": ["BP_220", "BP 220", "RA 7279"],
        "economic housing": ["BP_220", "BP 220", "RA 7279"],
        "udha": ["RA 7279"],
        "price ceiling": ["JMC 2025-001", "JMC 2023-003"],
        
        # Zoning -> LGU Ordinances
        "taguig": ["Taguig Ord. 15-2003"],
        "taguig zoning": ["Taguig Ord. 15-2003"],
        "makati": ["Makati Zoning"],
        "makati zoning": ["Makati Zoning"],
        "manila": ["Manila Ord. 8119"],
        "manila zoning": ["Manila Ord. 8119"],
        "zoning ordinance": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "land use": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        
        # Local Government Code -> RA 7160
        "local government code": ["RA 7160"],
        "lgc": ["RA 7160"],
        "ra 7160": ["RA 7160"],
        "barangay": ["RA 7160"],
        "municipal": ["RA 7160"],
        
        # Heritage -> RA 10066
        "heritage": ["RA 10066"],
        "heritage zone": ["RA 10066"],
        "cultural property": ["RA 10066"],
        "national cultural": ["RA 10066"],
        "historical": ["RA 10066"],
        "ra 10066": ["RA 10066"],
        
        # DPWH Department Orders
        "dpwh": ["DPWH DO 127", "DPWH DO 166", "DPWH DO 48", "DPWH DO 131"],
        "do 127": ["DPWH DO 127"],
        "do 166": ["DPWH DO 166"],
        "do 48": ["DPWH DO 48"],
        "do 131": ["DPWH DO 131"],
        "design guidelines": ["DPWH DO 127"],
        "completion certificate": ["DPWH DO 166"],
        "design audit": ["DPWH DO 48", "DPWH DO 131"],
        
        # Construction Safety -> DOLE DO 13
        "construction safety": ["DOLE DO 13"],
        "worker safety": ["DOLE DO 13"],
        "dole": ["DOLE DO 13"],
        "occupational safety": ["DOLE DO 13"],
        
        # Procurement -> RA 12009, GPPB
        "procurement": ["RA 12009", "GPPB Res. 02-2025"],
        "gppb": ["GPPB Res. 02-2025"],
        "bidding": ["RA 12009", "GPPB Res. 02-2025"],
        
        # ADR -> RA 9285
        "adr": ["RA 9285"],
        "arbitration": ["RA 9285"],
        "mediation": ["RA 9285"],
        "dispute resolution": ["RA 9285"],
        
        # Civil Code -> RA 386
        "civil code": ["RA 386"],
        "ra 386": ["RA 386"],
        "property rights": ["RA 386"],
        "easement": ["RA 386"],
    }
    
    # Domain keywords for hybrid search pre-filtering
    DOMAIN_KEYWORDS = [
        # Dimensions
        "width", "height", "length", "area", "distance", "minimum", "maximum",
        "meter", "meters", "sqm", "square meter", "dimension",
        # Building elements
        "corridor", "hallway", "stairway", "stair", "exit", "door", "window",
        "ceiling", "floor", "wall", "roof", "foundation", "column", "beam",
        # Compliance terms
        "requirement", "compliant", "compliance", "regulation", "standard",
        "code", "section", "rule", "provision", "shall", "must",
        # Occupancy types
        "residential", "commercial", "industrial", "institutional", "office",
        "assembly", "educational", "hospital", "hotel", "warehouse",
        # Fire safety
        "travel distance", "exit capacity", "fire resistance", "compartment",
        # Accessibility
        "ramp gradient", "grab bar", "toilet", "parking", "signage",
    ]
    
    @classmethod
    def get_mode_config(cls, mode: str) -> dict:
        """Get configuration for a specific mode."""
        return cls.MODE_CONFIG.get(mode, cls.MODE_CONFIG["quick_answer"])
    
    @classmethod
    def route_to_laws(cls, query: str) -> List[str]:
        """
        Detect intent keywords and return prioritized law codes.
        Returns list of law_code values to prioritize in search.
        """
        query_lower = query.lower()
        matched_laws = set()
        
        for keyword, law_codes in cls.LAW_ROUTING_RULES.items():
            if keyword in query_lower:
                matched_laws.update(law_codes)
        
        return list(matched_laws)
    
    @classmethod
    def extract_keywords(cls, query: str) -> List[str]:
        """
        Extract domain-specific keywords from query for hybrid search.
        Returns list of keywords found in the query.
        """
        query_lower = query.lower()
        found_keywords = []
        
        for keyword in cls.DOMAIN_KEYWORDS:
            if keyword in query_lower:
                found_keywords.append(keyword)
        
        return found_keywords
    
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
            similarity_threshold = config.get("similarity_threshold", 0.3)
            
            # Law Router: Detect intent and get prioritized law codes
            priority_laws = self.route_to_laws(query)
            keywords = self.extract_keywords(query)
            
            if settings.DEBUG:
                logger.debug(f"RAG mode: {mode}, top_k: {top_k}, threshold: {similarity_threshold}")
                if priority_laws:
                    logger.debug(f"Law Router matched: {priority_laws}")
                if keywords:
                    logger.debug(f"Keywords extracted: {keywords}")
            
            # Search for similar documents (filtering handled by search service)
            results = await self.search_service.search(
                query, 
                top_k=top_k, 
                similarity_threshold=similarity_threshold,
                document_types=doc_types
            )
            
            # HYBRID SEARCH: If Law Router detected specific laws, fetch those directly
            if priority_laws:
                try:
                    query_embedding = self.search_service.embedding_service.embed(query)
                    
                    # Search specifically for documents from priority law codes
                    for law_code in priority_laws[:3]:  # Limit to top 3 laws
                        law_results = supabase.table('rag_documents') \
                            .select('id, content, source, law_code, document_type, section_ref, chunk_index, embedding') \
                            .eq('law_code', law_code) \
                            .limit(2) \
                            .execute()
                        
                        if law_results.data:
                            existing_ids = {r.get('id') for r in results}
                            for doc in law_results.data:
                                if doc.get('id') not in existing_ids:
                                    # Calculate similarity manually
                                    import json
                                    import numpy as np
                                    stored_embed = doc.get('embedding')
                                    if stored_embed:
                                        if isinstance(stored_embed, str):
                                            stored_embed = json.loads(stored_embed)
                                        sim = float(np.dot(query_embedding, stored_embed) / 
                                                  (np.linalg.norm(query_embedding) * np.linalg.norm(stored_embed)))
                                        doc['similarity'] = min(1.0, sim + 0.15)  # Boost by 15%
                                        del doc['embedding']  # Don't need to keep this
                                        results.append(doc)
                                        existing_ids.add(doc.get('id'))
                    
                    # Re-sort by similarity
                    results = sorted(results, key=lambda x: x.get('similarity', 0), reverse=True)
                    results = results[:top_k]  # Trim to top_k
                    
                except Exception as e:
                    logger.warning(f"Hybrid law search failed: {e}")
                    # Fall back to just boosting existing results
                    for doc in results:
                        doc_law_code = doc.get('law_code', '')
                        if any(law in str(doc_law_code) for law in priority_laws):
                            doc['similarity'] = min(1.0, doc.get('similarity', 0) + 0.1)
                    results = sorted(results, key=lambda x: x.get('similarity', 0), reverse=True)
            
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
                    similarity=round(similarity, 3),
                    content=content,                      # Include actual content
                    law_code=doc.get('law_code', '')      # Include law code
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