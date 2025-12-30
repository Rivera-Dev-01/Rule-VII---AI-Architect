from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Dict
from datetime import datetime

class AttachmentMetadata(BaseModel):
    name: str = Field(..., max_length=255)
    type: str = Field(..., max_length=100)
    size: int = Field(..., gt=0, le=10485760)  # Max 10MB
    url: str = Field(..., max_length=2000)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = Field(None, max_length=100)
    project_id: Optional[str] = Field(None, max_length=100)
    mode: str = Field(default="quick_answer")  # quick_answer | plan_draft | compliance
    attachments: Optional[List[AttachmentMetadata]] = Field(None, max_length=5)
    
    @field_validator('message')
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        # Remove null bytes and control characters (except newlines/tabs)
        return v.replace('\x00', '').strip()

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
    conversation_id: str = Field(..., max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    summary: Optional[str] = Field(None, max_length=1000)
    content: Optional[str] = Field(None, max_length=50000)

class ProposalUpdateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    summary: Optional[str] = Field(None, max_length=1000)
    content: Optional[str] = Field(None, max_length=50000)