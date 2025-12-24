from pydantic import BaseModel
from typing import Optional, Literal
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
    # Project lifecycle cycle
    cycle: Optional[Literal['active', 'approved']] = 'active'
    # Project priority level
    priority: Optional[Literal['low', 'medium', 'critical']] = 'low'


# ===========================
# 3. Update Schema (For partial updates - all fields optional)
# ===========================


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    cycle: Optional[Literal['active', 'approved']] = None
    priority: Optional[Literal['low', 'medium', 'critical']] = None


# ===========================
# 4. Database Schema (Output to Frontend)
# ===========================


class ProjectDB(ProjectBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    # Project lifecycle and priority
    cycle: Optional[str] = 'active'
    priority: Optional[str] = 'low'

    class Config:
        from_attributes = True

