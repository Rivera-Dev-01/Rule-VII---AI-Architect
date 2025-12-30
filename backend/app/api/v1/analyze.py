from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import fitz  # PyMuPDF
from app.services.vision_engine import vision_engine
from app.models.chat import ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def analyze_plan(
    file: UploadFile = File(...),
    message: Optional[str] = Form(None)
):
    """
    Analyze architectural floor plans (PDF or Image) using Vision AI.
    Converts PDF to image if necessary.
    Returns standard ChatResponse format.
    """
    try:
        content_type = file.content_type
        file_bytes = await file.read()
        image_bytes = None

        if content_type == "application/pdf":
            # Convert PDF to Image (First Page)
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                if doc.page_count < 1:
                    raise HTTPException(status_code=400, detail="Empty PDF")
                
                # Render first page
                page = doc[0]
                # Zoom = 2.0 for higher resolution (important for blueprints)
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat)
                image_bytes = pix.tobytes("png")
                
        elif content_type.startswith("image/"):
            image_bytes = file_bytes
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")

        # Send to Vision Engine with user prompt if provided
        analysis_result = vision_engine.analyze_image(image_bytes, prompt=message or "")
        
        return ChatResponse(
            response=analysis_result,
            sources=[],  # Vision analysis doesn't cite specific documents yet
            conversation_id="analysis" 
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
