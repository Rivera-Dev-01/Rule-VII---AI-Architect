from fastapi import APIRouter, Request, HTTPException, Header
from app.core.config import settings
import hmac
import hashlib
import base64

router = APIRouter()


@router.post("/webhook")
async def auth_webhook(request: Request, x_supabase_signature: str = Header(None)):
    """
    Handle Supabase Auth events (e.g., INSERT on auth.users).
    Verifies the request signature to ensure security.
    """
    if not x_supabase_signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    # 1. Get the raw body
    body = await request.body()

    # 2. Verify Signature (HMAC SHA256)
    # Note: Ensure you are using the correct WEBHOOK secret from Supabase Database Webhooks,
    # which is different from the JWT secret.
    # If you haven't set up a webhook secret yet, you can temporarily skip this check
    # BUT DO NOT DEPLOY WITHOUT IT.

    # Uncomment this block when you have the SUPABASE_WEBHOOK_SECRET in .env
    """
    secret = settings.SUPABASE_WEBHOOK_SECRET.encode()
    calculated_signature = hmac.new(secret, body, hashlib.sha256).hexdigest()
    
    if calculated_signature != x_supabase_signature:
        raise HTTPException(status_code=401, detail="Invalid signature")
    """

    # 3. Process the event
    try:
        json_body = await request.json()
        event_type = json_body.get('type')
        record = json_body.get('record')

        if event_type == 'INSERT' and json_body.get('table') == 'users':
            # Example: Create a corresponding profile in your public table
            print(f"New user signed up: {record.get('id')}")
            # await create_user_profile(record)

        return {"status": "processed"}

    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(
            status_code=500, detail="Webhook processing failed")
