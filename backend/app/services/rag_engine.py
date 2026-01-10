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
            "top_k": 6,                    # Increased from 4 for richer context
            "doc_types": None,             # Search all documents
            "temperature": 0.2,            # Lower for more focused responses
            "similarity_threshold": 0.30,  # Slightly lower to capture more
        },
        "plan_draft": {
            "top_k": 8,                    # Increased from 5
            "doc_types": ["statutory", "procedural", "specialized_planning"],
            "temperature": 0.3,            # Slightly lower
            "similarity_threshold": 0.30,
        },
        "compliance": {
            "top_k": 10,                   # Increased from 6 for comprehensive analysis
            "doc_types": None,             # Search all core laws
            "temperature": 0.1,            # Much lower for factual accuracy
            "similarity_threshold": 0.25,  # Lower to get more relevant sections
        },
        "deep_thinking": {
            "top_k": 12,                   # More docs for comprehensive analysis
            "doc_types": None,             # Will include expanded dataset later
            "temperature": 0.3,            # Balanced
            "similarity_threshold": 0.25,
        }
    }
    
    # Law Router - Maps keywords/intents to prioritized law codes
    LAW_ROUTING_RULES = {
        # Fire safety keywords -> RA 9514
        "fire": ["RA 9514"],
        "fire exit": ["RA 9514"],
        "fire code": ["RA 9514"],
        "fire safety": ["RA 9514"],
        "sprinkler": ["RA 9514"],
        "smoke detector": ["RA 9514"],
        "fire alarm": ["RA 9514"],
        "fire extinguisher": ["RA 9514"],
        "emergency exit": ["RA 9514"],
        "egress": ["RA 9514"],
        "coffee shop": ["RA 9514", "PD 1096"],
        "commercial": ["RA 9514", "PD 1096"],
        "mercantile": ["RA 9514"],
        "retail": ["RA 9514", "PD 1096"],
        "restaurant": ["RA 9514", "PD 1096"],
        "shop": ["RA 9514", "PD 1096"],
        "travel distance": ["RA 9514"],
        "sprinkler spacing": ["RA 9514"],
        # Sprinkler calculation keywords
        "sprinkler coverage": ["RA 9514"],
        "coverage area": ["RA 9514"],
        "sqm per sprinkler": ["RA 9514"],
        "sprinkler head": ["RA 9514"],
        "detector spacing": ["RA 9514"],
        "smoke detector coverage": ["RA 9514"],
        "how many sprinkler": ["RA 9514"],
        "how many detector": ["RA 9514"],
        # Building classification keywords
        "building group": ["PD 1096"],
        "group e": ["PD 1096", "BP 344"],
        "transportation terminal": ["PD 1096", "BP 344"],
        "airport": ["PD 1096", "BP 344"],
        "terminal": ["PD 1096", "BP 344"],
        "heliport": ["BP 344"],
        
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
        "setback": ["PD_1096", "PD 1096", "Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "lot coverage": ["PD_1096", "PD 1096"],
        "ceiling height": ["PD_1096", "PD 1096", "BP_220", "BP 220"],
        "ceiling": ["PD_1096", "PD 1096"],
        "room height": ["PD_1096", "PD 1096"],
        "section 805": ["PD_1096", "PD 1096"],
        "habitable room": ["PD_1096", "PD 1096"],
        "minimum lot": ["BP_220", "BP 220", "PD_1096", "PD 1096"],
        "lot area": ["BP_220", "BP 220", "PD_1096", "PD 1096"],
        "lot size": ["BP_220", "BP 220", "PD_1096", "PD 1096"],
        "travel distance": ["RA_9514", "RA 9514", "PD_1096", "PD 1096"],
        "exit distance": ["RA_9514", "RA 9514"],
        "distance to exit": ["RA_9514", "RA 9514"],
        
        # Building Classification keywords -> PD 1096
        "building classification": ["PD_1096", "PD 1096"],
        "occupancy classification": ["PD_1096", "PD 1096"],
        "group a": ["PD_1096", "PD 1096"],
        "group b": ["PD_1096", "PD 1096"],
        "group c": ["PD_1096", "PD 1096"],
        "group d": ["PD_1096", "PD 1096"],
        "group e": ["PD_1096", "PD 1096"],
        "group f": ["PD_1096", "PD 1096"],
        "group g": ["PD_1096", "PD 1096"],
        "group h": ["PD_1096", "PD 1096"],
        "group i": ["PD_1096", "PD 1096"],
        "group j": ["PD_1096", "PD 1096"],
        "apartment": ["PD_1096", "PD 1096", "PD 957"],
        "condominium": ["PD_1096", "PD 1096", "PD 957"],
        "residential building": ["PD_1096", "PD 1096"],
        "office building": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "warehouse": ["PD_1096", "PD 1096"],
        
        # Stairs & Egress keywords -> PD 1096
        "stair": ["PD_1096", "PD 1096"],
        "stair width": ["PD_1096", "PD 1096"],
        "stairway": ["PD_1096", "PD 1096"],
        "exit": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "means of egress": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "occupancy load": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "riser": ["PD_1096", "PD 1096"],
        "tread": ["PD_1096", "PD 1096"],
        
        # Fire Resistance keywords -> PD 1096 & RA 9514
        "fire resistance": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "fire rating": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "fire resistive": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        "hour fire": ["PD_1096", "PD 1096", "RA_9514", "RA 9514"],
        
        # Parking keywords -> PD 1096
        "parking": ["PD_1096", "PD 1096"],
        "parking slot": ["PD_1096", "PD 1096"],
        "parking requirement": ["PD_1096", "PD 1096"],
        "parking space": ["PD_1096", "PD 1096"],
        "car park": ["PD_1096", "PD 1096"],
        
        # Green building -> Philippine Green Building Code
        "green building": ["PGB Code"],
        "sustainable": ["PGB Code"],
        "energy efficiency": ["PGB Code"],
        "leed": ["PGB Code"],
        "green code": ["PGB Code"],
        "environmental": ["PGB Code"],
        
        # Housing -> BP 220
        "socialized housing": ["BP 220", "RA 7279", "JMC 2025-001", "JMC 2023-003"],
        "low cost housing": ["BP 220", "RA 7279"],
        "economic housing": ["BP 220", "RA 7279"],
        "udha": ["RA 7279"],
        "price ceiling": ["JMC 2025-001", "JMC 2023-003"],
        
        # Zoning -> LGU Ordinances (expanded with height and zone keywords)
        "taguig": ["Taguig Ord. 15-2003"],
        "taguig zoning": ["Taguig Ord. 15-2003"],
        "makati": ["Makati Zoning"],
        "makati zoning": ["Makati Zoning"],
        "manila": ["Manila Ord. 8119"],
        "manila zoning": ["Manila Ord. 8119"],
        "zoning ordinance": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "land use": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "building height": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119", "PD 1096"],
        "maximum height": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "bhl": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "building height limit": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "residential zone": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "commercial zone": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "industrial zone": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "zone classification": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "allowable density": ["Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        
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
        "ciac": ["RA 9285"],
        
        # Civil Code -> RA 386
        "civil code": ["RA 386"],
        "ra 386": ["RA 386"],
        "property rights": ["RA 386"],
        "easement": ["RA 386"],
        "nuisance": ["RA 386"],
        "neighbor": ["RA 386"],
        "boundary": ["RA 386"],
        "encroachment": ["RA 386"],
        "right of way": ["RA 386"],
        "servitude": ["RA 386"],
        "party wall": ["RA 386"],
        "lateral support": ["RA 386"],
        "light and view": ["RA 386"],
        "article 650": ["RA 386"],
        "article 651": ["RA 386"],
        
        # PD 957 - Subdivision & Condominium (expanded)
        "subdivision": ["PD 957"],
        "condominium": ["PD 957", "PD 1096"],
        "developer": ["PD 957"],
        "buyer": ["PD 957"],
        "hlurb": ["PD 957"],
        "dhsud": ["PD 957", "RA 7279"],
        "license to sell": ["PD 957"],
        "development permit": ["PD 957"],
        "registration": ["PD 957"],
        "subdivision plan": ["PD 957"],
        "subdivision development": ["PD 957"],
        "certificate of registration": ["PD 957"],
        "condo project": ["PD 957"],
        "condo buyers": ["PD 957"],
        "real estate": ["PD 957"],
        "salesman": ["PD 957"],
        "broker": ["PD 957"],
        
        # RA 9266 - Architecture Act (expanded)
        "architect": ["RA 9266"],
        "architecture": ["RA 9266"],
        "prc": ["RA 9266"],
        "professional license": ["RA 9266"],
        "uap": ["RA 9266"],
        "architectural": ["RA 9266"],
        "architect responsibility": ["RA 9266"],
        "responsibilities": ["RA 9266"],
        "duties": ["RA 9266"],
        "scope of practice": ["RA 9266"],
        "professional practice": ["RA 9266"],
        "architect seal": ["RA 9266"],
        "code of ethics": ["RA 9266"],
        "board of architecture": ["RA 9266"],
        
        # JMC 2018-01 - Building Permit Procedures (expanded)
        "permit procedure": ["JMC 2018-01", "PD 1096"],
        "one-stop shop": ["JMC 2018-01"],
        "dilg": ["JMC 2018-01", "RA 7160"],
        "permit processing": ["JMC 2018-01"],
        "application form": ["JMC 2018-01", "PD 1096"],
        "documentary requirements": ["JMC 2018-01"],
        "processing time": ["JMC 2018-01"],
        "building official": ["JMC 2018-01", "PD 1096"],
        "15 days": ["JMC 2018-01"],
        
        # NBCDO MC 1
        "nbcdo": ["NBCDO MC 1"],
        "circular": ["NBCDO MC 1"],
        
        # RA 7279 - UDHA (Urban Development & Housing Act)
        "urban development": ["RA 7279"],
        "informal settler": ["RA 7279"],
        "relocation": ["RA 7279"],
        "on-site development": ["RA 7279"],
        "socialized": ["RA 7279", "BP_220", "BP 220"],
        "medium cost": ["RA 7279", "BP_220", "BP 220", "JMC 2025-001", "JMC 2023-003"],
        "open market": ["RA 7279", "JMC 2025-001", "JMC 2023-003"],
        "housing price": ["JMC 2025-001", "JMC 2023-003"],
        "selling price": ["JMC 2025-001", "JMC 2023-003"],
        
        # RA 12009 & GPPB - Procurement
        "philgeps": ["RA 12009", "GPPB Res. 02-2025"],
        "contract": ["RA 12009"],
        "bid": ["RA 12009", "GPPB Res. 02-2025"],
        "threshold": ["GPPB Res. 02-2025"],
        "public bidding": ["RA 12009", "GPPB Res. 02-2025"],
        
        # DOLE DO 13 - Construction Safety (expanded)
        "osh": ["DOLE DO 13"],
        "safety officer": ["DOLE DO 13"],
        "scaffold": ["DOLE DO 13"],
        "ppe": ["DOLE DO 13"],
        "fall protection": ["DOLE DO 13"],
        "excavation": ["DOLE DO 13"],
        "safety equipment": ["DOLE DO 13"],
        "hard hat": ["DOLE DO 13"],
        "helmet": ["DOLE DO 13"],
        
        # DPWH DOs (expanded)
        "road design": ["DPWH DO 127"],
        "structural plan": ["DPWH DO 127"],
        "final inspection": ["DPWH DO 166"],
        "value engineering": ["DPWH DO 48", "DPWH DO 131"],
        "drawing scale": ["DPWH DO 127"],
        "plan scale": ["DPWH DO 127"],
        "scale": ["DPWH DO 127"],
        "technical specifications": ["DPWH DO 127"],
        "site inspection": ["DPWH DO 166"],
        "certificate of completion": ["DPWH DO 166"],
        
        # Common architect query terms
        "height limit": ["PD 1096", "Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "floor area ratio": ["PD 1096", "Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "far": ["PD 1096", "Taguig Ord. 15-2003", "Makati Zoning", "Manila Ord. 8119"],
        "percentage of site occupancy": ["PD 1096"],
        "pso": ["PD 1096"],
        "open space": ["PD 1096", "BP 220"],
        "ventilation": ["PD 1096"],
        "natural light": ["PD 1096"],
        "toilet": ["PD 1096", "BP 344"],
        "plumbing": ["PD_1096", "PD 1096"],
        "electrical": ["PD_1096", "PD 1096"],
        "sanitary": ["PD_1096", "PD 1096"],
        "drainage": ["PD_1096", "PD 1096"],
        "septic": ["PD_1096", "PD 1096"],
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
                # Normalize law codes to match database format (spaces, not underscores)
                normalized_laws = []
                for lc in priority_laws:
                    normalized = lc.replace("_", " ")
                    if normalized not in normalized_laws:
                        normalized_laws.append(normalized)
                
                logger.info(f"HYBRID SEARCH: Priority laws detected: {normalized_laws}")
                try:
                    query_embedding = self.search_service.embedding_service.embed(query)
                    
                    # Search specifically for documents from priority law codes
                    for law_code in normalized_laws[:4]:  # Limit to top 4 laws
                        logger.info(f"HYBRID SEARCH: Fetching docs for law_code='{law_code}'")
                        law_results = supabase.table('rag_documents') \
                            .select('id, content, source, law_code, document_type, section_ref, chunk_index, embedding') \
                            .eq('law_code', law_code) \
                            .limit(8) \
                            .execute()
                        
                        logger.info(f"HYBRID SEARCH: Found {len(law_results.data) if law_results.data else 0} docs for {law_code}")
                        
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
                                        logger.info(f"HYBRID SEARCH: Added doc from {law_code} with sim={doc['similarity']:.3f}")
                    
                    # Re-sort by similarity
                    results = sorted(results, key=lambda x: x.get('similarity', 0), reverse=True)
                    results = results[:top_k]  # Trim to top_k
                    logger.info(f"HYBRID SEARCH: Final results count: {len(results)}")
                    
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
            
            # Law Router: Detect intent and get prioritized law codes
            priority_laws = self.route_to_laws(query)
            
            # Extract key terms for content filtering
            query_lower = query.lower()
            content_keywords = []
            if "ceiling" in query_lower or "room height" in query_lower:
                content_keywords.append("2.40")
                content_keywords.append("ceiling height")
                content_keywords.append("section 805")
            if "lot area" in query_lower or "lot size" in query_lower or "minimum lot" in query_lower:
                content_keywords.append("minimum lot area")
                content_keywords.append("single detached")
                content_keywords.append("72 sqm")
                content_keywords.append("64 sqm")
            if "socialized" in query_lower or "housing" in query_lower:
                content_keywords.append("socialized")
                content_keywords.append("economic housing")
            if "travel distance" in query_lower or ("exit" in query_lower and "distance" in query_lower):
                content_keywords.append("61")
                content_keywords.append("travel distance")
                content_keywords.append("46")
            # Building height queries
            if "building height" in query_lower or "maximum height" in query_lower or "height limit" in query_lower:
                content_keywords.append("building height limit")
                content_keywords.append("BHL")
                content_keywords.append("storey")
                content_keywords.append("meters")
            # Subdivision/license to sell queries
            if "license to sell" in query_lower or ("subdivision" in query_lower and "developer" in query_lower):
                content_keywords.append("registration")
                content_keywords.append("license to sell")
                content_keywords.append("section 5")
            # Architect responsibilities
            if "architect" in query_lower and ("responsib" in query_lower or "duties" in query_lower):
                content_keywords.append("responsibility")
                content_keywords.append("duties")
                content_keywords.append("scope")
            # Easements
            if "easement" in query_lower or "right of way" in query_lower:
                content_keywords.append("easement")
                content_keywords.append("right of way")
                content_keywords.append("article 650")
            # Safety equipment
            if "safety" in query_lower and "equipment" in query_lower:
                content_keywords.append("PPE")
                content_keywords.append("hard hat")
                content_keywords.append("helmet")
            # Sprinkler/detector calculation
            if "sprinkler" in query_lower or "smoke detector" in query_lower:
                content_keywords.append("spacing")
                content_keywords.append("coverage")
                content_keywords.append("sqm")
                content_keywords.append("per sprinkler")
            # Building classification/group
            if "classification" in query_lower or "group" in query_lower or "airport" in query_lower:
                content_keywords.append("group")
                content_keywords.append("occupancy")
                content_keywords.append("classification")
            
            if priority_laws:
                logger.info(f"GET_CONTEXT: Law Router matched: {priority_laws}")
            
            results = await self.search_service.search(query, top_k=top_k, document_types=doc_types)
            
            # HYBRID SEARCH: If Law Router detected specific laws, fetch those directly
            if priority_laws:
                # Normalize law codes to match database format (spaces, not underscores)
                normalized_laws = []
                for lc in priority_laws:
                    normalized = lc.replace("_", " ")
                    if normalized not in normalized_laws:
                        normalized_laws.append(normalized)
                
                logger.info(f"GET_CONTEXT: Fetching law-specific documents for {normalized_laws[:4]}")
                try:
                    query_embedding = self.search_service.embedding_service.embed(query)
                    
                    # Search specifically for documents from priority law codes
                    for law_code in normalized_laws[:4]:  # Limit to top 4 laws
                        # Try content-filtered search first for specific queries
                        law_results = None
                        
                        # Add content filter based on query keywords
                        if content_keywords:
                            for keyword in content_keywords:
                                filtered_results = supabase.table('rag_documents') \
                                    .select('id, content, source, law_code, document_type, section_ref, chunk_index, embedding') \
                                    .eq('law_code', law_code) \
                                    .ilike('content', f'%{keyword}%') \
                                    .limit(4) \
                                    .execute()
                                if filtered_results.data:
                                    if law_results is None:
                                        law_results = filtered_results
                                    else:
                                        # Merge results
                                        existing = {d['id'] for d in law_results.data}
                                        for d in filtered_results.data:
                                            if d['id'] not in existing:
                                                law_results.data.append(d)
                                                existing.add(d['id'])
                        
                        # Fallback to regular search if no filtered results
                        if not law_results or not law_results.data:
                            law_results = supabase.table('rag_documents') \
                                .select('id, content, source, law_code, document_type, section_ref, chunk_index, embedding') \
                                .eq('law_code', law_code) \
                                .limit(8) \
                                .execute()
                        
                        logger.info(f"GET_CONTEXT: Found {len(law_results.data) if law_results.data else 0} docs for {law_code}")
                        
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
                                        logger.info(f"GET_CONTEXT: Added doc from {law_code}")
                    
                    # Re-sort by similarity
                    results = sorted(results, key=lambda x: x.get('similarity', 0), reverse=True)
                    results = results[:top_k]  # Trim to top_k
                    
                except Exception as e:
                    logger.warning(f"GET_CONTEXT: Hybrid law search failed: {e}")
            
            if not results:
                return ""
            
            # === RELEVANCE RANKING IMPROVEMENTS ===
            
            # 1. Sort by similarity (ensure consistent ordering)
            results = sorted(results, key=lambda x: x.get('similarity', 0), reverse=True)
            
            # 2. Similarity cutoff - remove chunks below threshold (reduce noise)
            min_similarity = 0.35
            results = [r for r in results if r.get('similarity', 0) >= min_similarity]
            
            # 3. De-duplicate similar content (>80% overlap)
            seen_content = []
            unique_results = []
            for doc in results:
                content = doc.get('content', '')[:200]  # First 200 chars for comparison
                is_duplicate = False
                for seen in seen_content:
                    # Simple overlap check
                    if content[:100] in seen or seen[:100] in content:
                        is_duplicate = True
                        break
                if not is_duplicate:
                    unique_results.append(doc)
                    seen_content.append(content)
            results = unique_results
            
            if not results:
                return ""
            
            # Format context with source attribution including section reference
            context_parts = []
            for idx, doc in enumerate(results):
                content = doc.get('content', '')
                source = doc.get('source', 'Unknown')
                law_code = doc.get('law_code', '')
                section_ref = doc.get('section_ref', '')
                similarity = doc.get('similarity', 0)
                
                # 4. Add relevance markers to top 3 chunks
                if idx < 3:
                    relevance_marker = "[★ HIGH RELEVANCE] "
                else:
                    relevance_marker = ""
                
                # Build attribution header with section reference if available
                if section_ref:
                    attribution = f"{relevance_marker}[Source: {source}] [Law: {law_code}] [Section: {section_ref}]"
                else:
                    attribution = f"{relevance_marker}[Source: {source}] [Law: {law_code}]"
                    
                context_parts.append(f"{attribution}\n{content}")
            
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