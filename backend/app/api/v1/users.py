from fastapi import APIRouter, Depends, HTTPException
import logging
from app.core.security import verify_token
from app.core.database import supabase
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    username: str
    email: str | None = None
    avatar_url: str | None = None
    role: str | None = "Free License"


@router.get("/me", response_model=UserProfile)
async def get_user(user: dict = Depends(verify_token)):
    # The ID from the JWT token
    token_user_id = user.get('sub')
    email_from_token = user.get('email', "Unknown")

    try:
        # 1. Query the 'users' table using the correct column 'user_id'
        response = (
            supabase.table("users")
            .select("*")
            # <--- FIX 1: Matched to your screenshot
            .eq("user_id", token_user_id)
            .maybe_single()
            .execute()
        )

        if response.data:
            data = response.data

            # 2. Construct a 'username' from your first_name + last_name
            # (Since you don't have a 'username' column)
            full_name = f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(
            )
            if not full_name:
                full_name = email_from_token.split(
                    "@")[0]  # Fallback if names are empty

            return {
                "id": str(data.get("user_id")),
                "username": full_name,  # <--- FIX 2: Mapped first/last name to username
                "email": data.get("email"),
                # <--- FIX 3: Mapped correct column
                "avatar_url": data.get("profile_picture_url"),
                "role": "Architect"  # You can default this to "Architect" since column is missing
            }

    except Exception as e:
        logger.error(f"Database error fetching user: {e}")

    # 3. Failsafe if still not found
    return {
        "id": token_user_id,
        "username": "Guest (DB Error)",
        "email": email_from_token,
        "role": "Free License",
        "avatar_url": None
    }
