from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_engine import RAGEngine

router = APIRouter()
rag_engine = RAGEngine()

class LawLookupRequest(BaseModel):
    query: str

class LawLookupResponse(BaseModel):
    content: str
    source: str
    relevance: float

@router.post("/lookup", response_model=LawLookupResponse)
async def lookup_law(request: LawLookupRequest):
    """
    Perform a targeted lookup for a specific law or code citation.
    Uses strict top_k=1 to find the most relevant section.
    """
    try:
        # We prioritize high relevance for direct lookups
        # Use simple 'quick_answer' config or override manually
        results = await rag_engine.search_service.search(
            query=request.query,
            top_k=1,
            document_types=None 
        )

        if not results:
            return LawLookupResponse(
                content="Reference not found in the database.",
                source="System",
                relevance=0.0
            )

        best_match = results[0]
        
        return LawLookupResponse(
            content=best_match.get('content', ''),
            source=best_match.get('source', 'Unknown'),
            relevance=best_match.get('similarity', 0.0)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
