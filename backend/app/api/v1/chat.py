import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.core.security import verify_token
from app.core.database import supabase
from app.models.chat import ChatRequest, ChatResponse, ChatHistoryItem, Message,ProposalSaveRequest
from app.services.rag_engine import RAGEngine
from app.services.llm_engine import LLMEngine

router = APIRouter()
rag_engine = RAGEngine()
llm_engine = LLMEngine()

print("✨ CHAT ROUTER LOADED")  # DEBUG


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, user_data: dict = Depends(verify_token)):
    """
    Send message and get AI response
    Pattern: AUTH → ACCESS → DATA → LLM → API
    """
    print(f"🔐 USER DATA: {user_data}")  # DEBUG
    print(f"📝 REQUEST: {request}")  # DEBUG
    user_id = user_data.get('sub')

    # Generate new conversation_id if not provided
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        print(f"🆕 NEW CONVERSATION ID: {conversation_id}")
        
        # Create SESSION entry first to satisfy Foreign Key constraint
        try:
            supabase.table("sessions").insert({
                "id": conversation_id,
                "user_id": user_id
            }).execute()
        except Exception as e:
            print(f"ERROR CREATING SESSION: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create conversation session: {str(e)}")

    # 1. Save user message to database
    user_payload = {
        "conversation_id": conversation_id,
        "content": request.message,
        "role": "user",
        "user_id": user_id,
        "attachment": [att.model_dump() for att in request.attachments] if request.attachments else None
    }

    try:
        supabase.table("messages").insert(user_payload).execute()
    except Exception as e:
        print(f"ERROR SAVING USER MESSAGE: {e}")
        # Note: We might want to allow it to continue even if save fails, or raise error
        # raise HTTPException(status_code=500, detail="Failed to save message")

    # 2. Get RAG context (mock for now)
    sources = await rag_engine.retrieve(request.message, user_id)

    # 3. Generate AI response
    ai_result = await llm_engine.generate(request.message, sources)

    # 4. Save AI response to database
    ai_payload = {
        "conversation_id": conversation_id,  # Use the valid conversation_id
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
        conversation_id=conversation_id,  # Return the generated conversation_id
        proposal=ai_result.get("proposal")
    )


@router.get("/history", response_model=List[ChatHistoryItem])
async def get_history(user_data: dict = Depends(verify_token)):
    """Get list of past conversations"""
    user_id = user_data.get('sub')
    
    # Fetch all messages for user, ordered newest first
    response = supabase.table("messages")\
        .select("conversation_id, content, created_at")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
        
    # Group by conversation_id to get unique conversations + latest snippets
    history_map = {}
    for msg in response.data:
        cid = msg.get('conversation_id')
        if not cid: continue
        
        # Since we ordered internally by date desc, the first time we see a CID, it's the latest message
        if cid not in history_map:
            history_map[cid] = {
                "id": cid,
                "title": msg['content'][:60] + ("..." if len(msg['content']) > 60 else ""),
                "updated_at": msg['created_at']
            }
    
    return list(history_map.values())


@router.get("/{conversation_id}", response_model=List[Message])
async def get_conversation(conversation_id: str, user_data: dict = Depends(verify_token)):
    """Get messages for a specific conversation"""
    user_id = user_data.get('sub')
    
    response = supabase.table("messages")\
        .select("*")\
        .eq("conversation_id", conversation_id)\
        .eq("user_id", user_id)\
        .order("created_at", desc=False)\
        .execute()
    
    return response.data or []

@router.post("/proposal")
async def save_proposal(request: ProposalSaveRequest, user_data: dict = Depends(verify_token)):
    user_id = user_data.get('sub')
    
    try:
        data = {
            "user_id": user_id,
            "conversation_id": request.conversation_id,
            "title": request.title,
            "summary": request.summary,
            "content": request.content
        }
        
        # ✅ FIXED: Removed curly braces
        response = (
            supabase.table("saved_proposals")
            .insert(data)
            .execute()
        )
        
        return response.data[0]
    except Exception as e:
        print(f"ERROR SAVING PROPOSAL: {e}")
        raise HTTPException(status_code=500, detail="Failed to save proposal")

@router.get("/proposals/{conversation_id}")
async def get_saved_proposals(conversation_id: str, user_data: dict = Depends(verify_token)):
    user_id = user_data.get('sub')
    
    response = supabase.table("saved_proposals")\
        .select("*")\
        .eq("conversation_id", conversation_id)\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
        
    return response.data or []