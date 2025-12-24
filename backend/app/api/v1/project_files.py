# ==========================================
# PROJECT FILES API
# Handles file uploads for project context
# ==========================================

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
from app.core.security import verify_token
from app.core.database import supabase
import uuid

router = APIRouter()

# Security: Only allow these file types
ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
ALLOWED_EXTENSIONS = ['.pdf', '.jpeg', '.jpg', '.png']
MAX_SIZE = 10 * 1024 * 1024  # 10MB


# ==========================================
# 1. UPLOAD FILE TO PROJECT
# ==========================================
@router.post("/{project_id}/files")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(verify_token)
):
    """
    Upload a file to a project.
    Flow: Auth → Access Check → File Validation → Storage → Database
    """
    user_id = user.get('sub')
    
    # 1. Verify project ownership
    project = supabase.table("projects")\
        .select("id")\
        .eq("id", project_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    
    # 2. Validate file type (MIME type)
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Only PDF, JPEG, PNG allowed. Got: {file.content_type}"
        )
    
    # 3. Validate file extension
    file_ext = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension. Only .pdf, .jpeg, .jpg, .png allowed."
        )
    
    # 4. Read and validate size
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size is 10MB. Got: {len(content) / (1024*1024):.2f}MB"
        )
    
    # 5. Upload to Supabase Storage
    file_path = f"projects/{project_id}/{uuid.uuid4()}_{file.filename}"
    
    try:
        supabase.storage.from_("project-files").upload(file_path, content)
    except Exception as e:
        print(f"STORAGE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file to storage")
    
    # 6. Save metadata to database
    file_record = {
        "project_id": project_id,
        "user_id": user_id,
        "filename": file.filename,
        "file_path": file_path,
        "file_type": file.content_type,
        "file_size": len(content)
    }
    
    try:
        result = supabase.table("project_files").insert(file_record).execute()
        return result.data[0]
    except Exception as e:
        print(f"DATABASE ERROR: {e}")
        # Cleanup: Delete from storage if DB insert fails
        supabase.storage.from_("project-files").remove([file_path])
        raise HTTPException(status_code=500, detail="Failed to save file metadata")


# ==========================================
# 2. GET ALL FILES FOR A PROJECT
# ==========================================
@router.get("/{project_id}/files")
async def get_files(project_id: str, user: dict = Depends(verify_token)):
    """Get all files uploaded to a project"""
    user_id = user.get('sub')
    
    result = supabase.table("project_files")\
        .select("*")\
        .eq("project_id", project_id)\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
    
    return result.data or []


# ==========================================
# 3. DELETE A FILE
# ==========================================
@router.delete("/{project_id}/files/{file_id}")
async def delete_file(
    project_id: str, 
    file_id: str, 
    user: dict = Depends(verify_token)
):
    """Delete a file from project"""
    user_id = user.get('sub')
    
    # 1. Get file path first
    file_record = supabase.table("project_files")\
        .select("file_path")\
        .eq("id", file_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if not file_record.data:
        raise HTTPException(status_code=404, detail="File not found")
    
    # 2. Delete from storage
    try:
        supabase.storage.from_("project-files").remove([file_record.data[0]["file_path"]])
    except Exception as e:
        print(f"STORAGE DELETE ERROR: {e}")
        # Continue anyway - might already be deleted
    
    # 3. Delete from database
    supabase.table("project_files")\
        .delete()\
        .eq("id", file_id)\
        .eq("user_id", user_id)\
        .execute()
    
    return {"success": True}
