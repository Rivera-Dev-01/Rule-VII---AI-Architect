from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Your RAG logic here
    pass
