from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/")
async def analyze_plan(file: UploadFile = File(...)):
    # Your vision analysis logic here
    pass
