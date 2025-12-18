from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/webhook")
async def auth_webhook(request: Request):
    # Your Supabase webhook handler here
    pass
