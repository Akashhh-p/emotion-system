from fastapi import APIRouter
from pydantic import BaseModel

from app.services.fusion_service import FusionService

router = APIRouter()
fusion_service = FusionService()


# Request schema
class FusionRequest(BaseModel):
    text: dict | None = None
    speech: dict | None = None
    face: dict | None = None


@router.post("/analyze-fusion")
def analyze_fusion(request: FusionRequest):

    result = fusion_service.fuse(
        text=request.text,
        speech=request.speech,
        face=request.face
    )

    return result