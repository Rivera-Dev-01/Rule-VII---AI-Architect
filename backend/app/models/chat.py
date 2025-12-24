from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class AttachmentMetadata(BaseModel):
    name: str
    type: str
    size: int
    url: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    project_id: Optional[str] = None  # For project context injection
    attachments: Optional[List[AttachmentMetadata]] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Any]
    conversation_id: str
    proposal: Optional[Dict[str, Any]] = None

# --- NEW MODELS FOR HISTORY ---
class ChatHistoryItem(BaseModel):
    id: str
    title: str
    updated_at: datetime
    is_favorite: Optional[bool] = False

class Message(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    role: str
    content: str
    created_at: datetime
    proposal: Optional[Dict[str, Any]] = None
    attachment: Optional[Any] = None

class ProposalSaveRequest(BaseModel):
    conversation_id: str
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None

class ProposalUpdateRequest(BaseModel):
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None