from fastapi import APIRouter, Request, HTTPException, Header
import logging
from app.core.config import settings
import hmac
import hashlib

logger = logging.getLogger(__name__)

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
    # Uses SUPABASE_WEBHOOK_SECRET from your Supabase Database Webhooks settings
    if settings.SUPABASE_WEBHOOK_SECRET:
        secret = settings.SUPABASE_WEBHOOK_SECRET.encode()
        calculated_signature = hmac.new(secret, body, hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(calculated_signature, x_supabase_signature):
            logger.warning("Webhook signature verification failed")
            raise HTTPException(status_code=401, detail="Invalid signature")
    else:
        # In development without secret configured, log a warning
        if settings.DEBUG:
            logger.warning("SUPABASE_WEBHOOK_SECRET not configured - skipping signature verification")
        else:
            # In production, require the secret
            logger.error("SUPABASE_WEBHOOK_SECRET not configured in production!")
            raise HTTPException(status_code=500, detail="Webhook configuration error")

    # 3. Process the event
    try:
        json_body = await request.json()
        event_type = json_body.get('type')
        record = json_body.get('record')

        if event_type == 'INSERT' and json_body.get('table') == 'users':
            # Example: Create a corresponding profile in your public table
            if settings.DEBUG:
                logger.info(f"New user signed up: {record.get('id')}")
            # await create_user_profile(record)

        return {"status": "processed"}

    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(
            status_code=500, detail="Webhook processing failed")
