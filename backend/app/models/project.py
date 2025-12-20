from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# 1. Base Schema


class ProjectBase(BaseModel):
    name: str
    location: Optional[str] = None
    description: Optional[str] = None

# 2. Create Schema (What frontend sends)


class ProjectCreate(ProjectBase):
    pass

# 3. Database Schema (What backend sends back)


class ProjectDB(ProjectBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
