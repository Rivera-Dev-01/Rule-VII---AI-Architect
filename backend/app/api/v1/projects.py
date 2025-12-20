from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.security import verify_token
from app.core.database import supabase
from app.models.project import ProjectCreate, ProjectDB

router = APIRouter()


@router.get("/", response_model=List[ProjectDB])
async def get_projects(user=Depends(verify_token)):

    user_id = user.get('sub')
    response = supabase.table("projects").select(
        "*").eq("user_id", user_id).execute()
    return response.data


@router.post("/", response_model=ProjectDB)
async def create_project(project: ProjectCreate, user=Depends(verify_token)):
    user_id = user.get('sub')
    project_data = project.modal_dump()
    project_data['user_id'] = user_id
    response = supabase.table("projects").insert(project_data).execute()
    if response.status_code != 201:
        raise HTTPException(status_code=400, detail="Project creation failed")
    return response.data[0]
