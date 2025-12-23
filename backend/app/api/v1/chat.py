from fastapi import APIRouter, HTTPException, Depends
from app.core.security import verify_token
from app.core.database import supabase
from app.models.chat import ChatRequest, ChatResponse
from app.services.rag_engine import RAGEngine
from app.services.llm_engine import LLMEngine

router = APIRouter()
rag_engine = RAGEngine()
llm_engine = LLMEngine()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, user_data: dict = Depends(verify_token)):
    """
    Send message and get AI response
    Pattern: AUTH → ACCESS → DATA → LLM → API
    """
    user_id = user_data.get('sub')
    
    # 1. Save user message to database
    user_payload = {
        "conversation_id": request.conversation_id,
        "content": request.message,
        "role": "user",
        "user_id": user_id,
        "attachment": [att.model_dump() for att in request.attachments] if request.attachments else None
    }
    
    try:
        supabase.table("messages").insert(user_payload).execute()
    except Exception as e:
        print(f"ERROR SAVING USER MESSAGE: {e}")
        raise HTTPException(status_code=500, detail="Failed to save message")
    
    # 2. Get RAG context (mock for now)
    sources = await rag_engine.retrieve(request.message, user_id)
    
    # 3. Generate AI response
    ai_result = await llm_engine.generate(request.message, sources)
    
    # 4. Save AI response to database
    ai_payload = {
        "conversation_id": request.conversation_id,
        "content": ai_result["text"],
        "role": "assistant",
        "user_id": user_id,
        "proposal": ai_result.get("proposal")
    }
    
    try:
        supabase.table("messages").insert(ai_payload).execute()
    except Exception as e:
        print(f"ERROR SAVING AI MESSAGE: {e}")
    
    # 5. Return response to frontend
    return ChatResponse(
        response=ai_result["text"],
        sources=sources,
        conversation_id=request.conversation_id or "default",
        proposal=ai_result.get("proposal")
    )

