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
    relevance: float

@router.post("/lookup", response_model=LawLookupResponse)
async def lookup_law(request: LawLookupRequest):
    """
    Perform a targeted lookup for a specific law or code citation.
    1. Checks 'law_definitions' table for exact match (Structured Library).
    2. Fallback to RAG Vector Search if not found.
    """
    try:
        # 1. Try Structured Retrieval (Exact/Clean lookup)
        try:
            # A. Priority: Look for "Intro" or "Introduction" if query is a Law Code
            intro_res = supabase.table("law_definitions").select("*") \
                .eq("law_code", request.query) \
                .ilike("section_ref", "%Intro%") \
                .limit(1).execute()

            if intro_res.data:
                record = intro_res.data[0]
                return LawLookupResponse(
                     content=record['content'],
                     source=f"{record['law_code']} - {record['section_ref']} (Library)",
                     relevance=1.0
                )

            # B. Fallback: Any match (e.g., specific section "Rule VII")
            structured_res = supabase.table("law_definitions").select("*") \
                .or_(f"law_code.ilike.%{request.query}%,section_ref.ilike.%{request.query}%") \
                .limit(1).execute()

            if structured_res.data:
                record = structured_res.data[0]
                return LawLookupResponse(
                     content=record['content'],
                     source=f"{record['law_code']} - {record['section_ref']} (Library)",
                     relevance=1.0
                )
        except Exception as e:
            print(f"Structured lookup error: {e}")
        except Exception as e:
            print(f"Structured lookup error: {e}")

        # 2. Fallback: Vector Search (Fuzzy)
        # We prioritize high relevance for direct lookups
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
