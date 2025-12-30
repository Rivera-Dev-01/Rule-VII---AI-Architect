import uuid
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.security import verify_token
from app.core.database import supabase
from app.core.config import settings
from app.models.chat import ChatRequest, ChatResponse, ChatHistoryItem, Message, ProposalSaveRequest, ProposalUpdateRequest
from app.services.rag_engine import RAGEngine
from app.services.llm_engine import LLMEngine

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
rag_engine = RAGEngine()
llm_engine = LLMEngine()


@router.post("/", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, chat_request: ChatRequest, user_data: dict = Depends(verify_token)):
    """
    Send message and get AI response
    Pattern: AUTH → ACCESS → DATA → LLM → API
    Rate Limited: 20 messages per minute
    """
    user_id = user_data.get('sub')

    # Generate new conversation_id if not provided
    conversation_id = chat_request.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        if settings.DEBUG:
            logger.debug(f"New conversation created: {conversation_id}")
        
        # Create SESSION entry first to satisfy Foreign Key constraint
        try:
            session_data = {
                "id": conversation_id,
                "user_id": user_id
            }
            # Link session to project if provided
            if chat_request.project_id:
                session_data["project_id"] = chat_request.project_id
                
            supabase.table("sessions").insert(session_data).execute()
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise HTTPException(status_code=500, detail="Failed to create conversation session")

    # 1. Save user message to database
    user_payload = {
        "conversation_id": conversation_id,
        "content": chat_request.message,
        "role": "user",
        "user_id": user_id,
        "attachment": [att.model_dump() for att in chat_request.attachments] if chat_request.attachments else None
    }

    try:
        supabase.table("messages").insert(user_payload).execute()
    except Exception as e:
        logger.error(f"Error saving user message: {e}")

    # 2. Get RAG context with mode-based filtering
    sources = await rag_engine.retrieve(chat_request.message, user_id, mode=chat_request.mode)

    # 2.5 Get project context if project_id provided
    project_context = ""
    if chat_request.project_id:
        try:
            # Fetch project info
            project = supabase.table("projects")\
                .select("*")\
                .eq("id", chat_request.project_id)\
                .eq("user_id", user_id)\
                .execute()
            
            if project.data:
                p = project.data[0]
                project_context = f"""
PROJECT CONTEXT:
Name: {p.get('name', 'Unknown')}
Location: {p.get('location', 'Not specified')}
Description: {p.get('description', 'No description')}
"""
            
            # Fetch uploaded files
            files = supabase.table("project_files")\
                .select("filename, file_type")\
                .eq("project_id", chat_request.project_id)\
                .execute()
            
            if files.data:
                project_context += "\nUPLOADED FILES:\n"
                for f in files.data:
                    project_context += f"- {f['filename']} ({f['file_type']})\n"
            
            if settings.DEBUG:
                logger.debug(f"Project context loaded for project {chat_request.project_id}")
        except Exception as e:
            logger.error(f"Error fetching project context: {e}")

    # 3. Generate AI response (with project context)
    ai_result = await llm_engine.generate(chat_request.message, sources, project_context)

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
        logger.error(f"Error saving AI message: {e}")

    # 5. Return response to frontend
    return ChatResponse(
        response=ai_result["text"],
        sources=sources,
        conversation_id=conversation_id,  # Return the generated conversation_id
        proposal=ai_result.get("proposal")
    )


@router.get("/project/{project_id}/session")
async def get_project_session(project_id: str, user_data: dict = Depends(verify_token)):
    user_id = user_data.get('sub')
    
    try:
        result = supabase.table("sessions")\
            .select("id")\
            .eq("project_id", project_id)\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if result.data and len(result.data) > 0:
            return {"conversation_id": result.data[0]["id"]}
        return {"conversation_id": None}
    except Exception as e:
        logger.error(f"Error fetching project session: {e}")
        return {"conversation_id": None}


@router.get("/history", response_model=List[ChatHistoryItem])
async def get_history(user_data: dict = Depends(verify_token)):
    """Get list of past conversations"""
    user_id = user_data.get('sub')
    
    # Fetch all messages for user, ordered oldest first to get first user message
    response = supabase.table("messages")\
        .select("conversation_id, content, created_at, role")\
        .eq("user_id", user_id)\
        .order("created_at", desc=False)\
        .execute()
    
    # Fetch user's favorite conversations
    favorites_response = supabase.table("favorite_conversations")\
        .select("conversation_id")\
        .eq("user_id", user_id)\
        .execute()
    
    favorite_ids = set(f['conversation_id'] for f in favorites_response.data) if favorites_response.data else set()
    
    # Group by conversation_id
    # - Title = first USER message (like Claude AI)
    # - Updated_at = latest message timestamp
    history_map = {}
    latest_times = {}
    
    for msg in response.data:
        cid = msg.get('conversation_id')
        if not cid: continue
        
        # Track the latest timestamp for each conversation
        msg_time = msg['created_at']
        if cid not in latest_times or msg_time > latest_times[cid]:
            latest_times[cid] = msg_time
        
        # Only set title from the FIRST user message
        if cid not in history_map and msg.get('role') == 'user':
            content = msg['content']
            history_map[cid] = {
                "id": cid,
                "title": content[:60] + ("..." if len(content) > 60 else ""),
                "updated_at": msg_time,  # Will be updated below
                "is_favorite": cid in favorite_ids
            }
    
    # Update with latest timestamps
    for cid in history_map:
        history_map[cid]["updated_at"] = latest_times.get(cid, history_map[cid]["updated_at"])
    
    # Sort: favorites first, then by updated_at descending
    sorted_history = sorted(
        history_map.values(), 
        key=lambda x: (not x.get("is_favorite", False), x["updated_at"]),
        reverse=True
    )
    # Fix sort: favorites first (is_favorite=True should come first)
    sorted_history = sorted(
        history_map.values(), 
        key=lambda x: (-(1 if x.get("is_favorite") else 0), x["updated_at"]),
        reverse=True
    )
    
    return sorted_history


@router.post("/favorite/{conversation_id}")
async def toggle_favorite(conversation_id: str, user_data: dict = Depends(verify_token)):
    """Toggle favorite status of a conversation"""
    user_id = user_data.get('sub')
    
    try:
        # Check if already favorited
        existing = supabase.table("favorite_conversations")\
            .select("id")\
            .eq("user_id", user_id)\
            .eq("conversation_id", conversation_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            # Remove favorite
            supabase.table("favorite_conversations")\
                .delete()\
                .eq("user_id", user_id)\
                .eq("conversation_id", conversation_id)\
                .execute()
            return {"is_favorite": False}
        else:
            # Add favorite
            supabase.table("favorite_conversations")\
                .insert({
                    "user_id": user_id,
                    "conversation_id": conversation_id
                })\
                .execute()
            return {"is_favorite": True}
    except Exception as e:
        logger.error(f"Error toggling favorite: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle favorite")


# IMPORTANT: Static routes must come BEFORE dynamic routes
@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str, user_data: dict = Depends(verify_token)):
    """Delete a conversation and all its messages and proposals"""
    user_id = user_data.get('sub')
    
    try:
        # Delete all messages for this conversation
        supabase.table("messages")\
            .delete()\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", user_id)\
            .execute()
        
        # Delete all saved proposals for this conversation
        supabase.table("saved_proposals")\
            .delete()\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", user_id)\
            .execute()
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")


# Dynamic route - must come AFTER static routes
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
        logger.error(f"Error saving proposal: {e}")
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

@router.delete("/proposal/{id}")
async def delete_proposal(id: str, user_data: dict = Depends(verify_token)):
    user_id = user_data.get('sub')
    
    try:
        result = supabase.table("saved_proposals")\
            .delete()\
            .eq("id", id)\
            .eq("user_id", user_id)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Proposal not found")

        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting proposal: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete proposal")

@router.put("/proposal/{id}")
async def update_proposal(id: str, request: ProposalUpdateRequest, user_data: dict = Depends(verify_token)):

    user_id = user_data.get('sub')

    try:
        data = {
            "title": request.title,
            "summary": request.summary,
            "content": request.content,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        result = supabase.table("saved_proposals")\
            .update(data)\
            .eq("id", id)\
            .eq("user_id", user_id)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Proposal not found")

        return result.data[0]

    except Exception as e:
        logger.error(f"Error updating proposal: {e}")
        raise HTTPException(status_code=500, detail="Failed to update proposal")
