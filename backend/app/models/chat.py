from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.models.citation import SourceNode

class AttachmentMetaData(BaseModel):
    name: str
    type: str
    size: int

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    attachments: Optional[List[AttachmentMetaData]] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceNode]
    conversation_id: str
    proposal: Optional[Dict[str, Any]] = None