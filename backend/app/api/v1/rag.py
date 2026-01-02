from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_engine import RAGEngine
from app.core.database import supabase

router = APIRouter()
rag_engine = RAGEngine()

class LawLookupRequest(BaseModel):
    query: str

class LawLookupResponse(BaseModel):
    content: str
    source: str
    law_code: str = ""
    section_ref: str = ""
    relevance: float

@router.post("/lookup", response_model=LawLookupResponse)
async def lookup_law(request: LawLookupRequest):
    """
    Perform a targeted lookup for a specific law or code citation.
    Uses rag_documents table for semantic search.
    """
    try:
        # Search rag_documents via vector search
        results = await rag_engine.search_service.search(
            query=request.query,
            top_k=1,
            similarity_threshold=0.3
        )

        if not results:
            return LawLookupResponse(
                content="Reference not found in the database.",
                source="System",
                law_code="",
                section_ref="",
                relevance=0.0
            )

        best_match = results[0]
        
        return LawLookupResponse(
            content=best_match.get('content', ''),
            source=best_match.get('source', 'Unknown'),
            law_code=best_match.get('law_code', ''),
            section_ref=best_match.get('section_ref', ''),
            relevance=best_match.get('similarity', 0.0)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
