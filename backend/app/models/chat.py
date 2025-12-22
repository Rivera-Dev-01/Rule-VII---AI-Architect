from pydantic import BaseModel
from typing import Optional, List
from app.models.citation import SourceNode

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceNode]
    conversation_id: str
