# GET /expenses, GET /expenses/summary, PATCH /expenses/{id}

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user_id
from app.features.receipts import service
from app.features.receipts.schemas import ReceiptResponse, ReceiptListResponse

router = APIRouter(prefix="/receipts", tags=["receipts"])

ALLOWED_TYPES = {
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
    "application/pdf": "application/pdf",
}


@router.post("/upload", response_model=ReceiptResponse, status_code=201)
async def upload_receipt(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WEBP, PDF",
        )

    file_bytes = await file.read()
    mime_type = ALLOWED_TYPES[file.content_type]

    return service.process_receipt(
        db=db,
        user_id=user_id,
        file_bytes=file_bytes,
        filename=file.filename,
        mime_type=mime_type,
    )


@router.get("", response_model=ReceiptListResponse)
def list_receipts(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    receipts = service.get_user_receipts(db, user_id)
    return ReceiptListResponse(total=len(receipts), items=receipts)


@router.get("/{receipt_id}", response_model=ReceiptResponse)
def get_receipt(
    receipt_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.get_receipt_by_id(db, receipt_id, user_id)
