from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# ===========================
# 1. Base Schema (Shared Fields)
# ===========================


class ProjectBase(BaseModel):
    name: str
    location: Optional[str] = None
    description: Optional[str] = None

# ===========================
# 2. Create Schema (Input from Frontend)
# ===========================


class ProjectCreate(ProjectBase):
    # Allow frontend to set status (e.g. "Draft"), but default to "Active"
    status: Optional[str] = "Active"

# ===========================
# 3. Database Schema (Output to Frontend)
# ===========================


class ProjectDB(ProjectBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime

    # --- THIS WAS MISSING ---
    # We add this so the backend passes the score to the frontend.
    score: Optional[float] = None

    class Config:
        from_attributes = True
