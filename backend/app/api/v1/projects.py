from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.security import verify_token
from app.core.database import supabase
from app.models.project import ProjectCreate, ProjectDB

router = APIRouter()

# ==========================================
# 1. GET ALL PROJECTS (Merged Dashboard & My Projects)
# ==========================================


@router.get("/", response_model=List[ProjectDB])
async def get_projects(user: dict = Depends(verify_token)):
    user_id = user.get('sub')

    try:
        response = (
            supabase.table("projects")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"ERROR FETCHING PROJECTS: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 2. CREATE PROJECT (Fixed Typo)
# ==========================================
@router.post("/", response_model=ProjectDB)
async def create_project(project: ProjectCreate, user: dict = Depends(verify_token)):
    user_id = user.get('sub')

    # FIX: It is 'model_dump()', not 'modal_dump()'
    project_data = project.model_dump()
    project_data['user_id'] = user_id
    project_data['status'] = "Active"  # Default status

    try:
        response = supabase.table("projects").insert(project_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"ERROR CREATING PROJECT: {e}")
        raise HTTPException(status_code=400, detail="Project creation failed")


# ==========================================
# 3. DELETE PROJECT (Correct Logic)
# ==========================================
@router.delete("/{project_id}", response_model=ProjectDB)
async def delete_project(project_id: str, user: dict = Depends(verify_token)):
    user_id = user.get('sub')

    try:
        response = (
            supabase.table("projects")
            .delete()
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )

        # Check if project existed
        if not response.data:
            raise HTTPException(
                status_code=404, detail="Project not found or access denied")

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 4. UPDATE PROJECT (Fixed Method)
# ==========================================
# We use @router.put for updates, not delete!
@router.put("/{project_id}", response_model=ProjectDB)
async def update_project(project_id: str, project_update: ProjectCreate, user: dict = Depends(verify_token)):
    user_id = user.get('sub')

    # We only update the fields the user sent
    update_data = project_update.model_dump(exclude_unset=True)

    try:
        response = (
            supabase.table("projects")
            .update(update_data)  # Pass the new data here
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404, detail="Project not found or access denied")

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
