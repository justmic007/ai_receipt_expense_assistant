from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request, Query
from fastapi import Form
from typing import List
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.dependencies import get_db, get_current_user_id
from app.core.config import settings
from app.features.receipts import service
from app.features.receipts.models import Receipt, ReceiptBatch
from app.features.receipts.schemas import (
    ReceiptResponse,
    ReceiptListResponse,
    BatchStatusResponse,
)

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/receipts", tags=["receipts"])

ALLOWED_TYPES = {
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
    "application/pdf": "application/pdf",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload", response_model=ReceiptResponse, status_code=201)
@limiter.limit("10/minute")
async def upload_receipt(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: JPEG, PNG, WEBP, PDF",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, detail="File too large. Maximum size is 10MB"
        )

    mime_type = ALLOWED_TYPES[file.content_type]
    return service.process_receipt(
        db=db,
        user_id=user_id,
        file_bytes=file_bytes,
        filename=file.filename,
        mime_type=mime_type,
    )


@router.post(
    "/batch",
    status_code=202,
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "files": {
                                "type": "array",
                                "items": {"type": "string", "format": "binary"},
                                "description": "Receipt files (max 3, JPEG/PNG/WEBP/PDF, 10MB each)",
                            }
                        },
                        "required": ["files"],
                    }
                }
            }
        }
    },
)
@limiter.limit("5/minute")
async def upload_batch(
    request: Request,
    files: List[UploadFile] = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if len(files) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 receipts per batch")

    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided")

    files_data = []
    for file in files:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' has unsupported type. Allowed: JPEG, PNG, WEBP, PDF",
            )

        file_bytes = await file.read()

        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File '{file.filename}' is too large. Maximum size is 10MB",
            )

        mime_type = ALLOWED_TYPES[file.content_type]
        files_data.append((file.filename, file_bytes, mime_type))

    batch = service.create_batch(
        db=db,
        user_id=user_id,
        files_data=files_data,
        db_url=settings.DATABASE_URL,
    )

    return {
        "batch_id": str(batch.id),
        "total_count": batch.total_count,
        "message": f"Processing {batch.total_count} receipt(s). This may take 1-3 minutes.",
        "status_url": f"/api/v1/receipts/batch/{batch.id}",
    }


@router.get("/batch/{batch_id}")
def get_batch_status(
    batch_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    batch = service.get_batch_status(db, batch_id, user_id)
    receipts = (
        db.query(Receipt)
        .filter(Receipt.batch_id == batch.id)
        .order_by(Receipt.created_at.asc())
        .all()
    )
    return {
        "batch_id": str(batch.id),
        "status": batch.status,
        "total_count": batch.total_count,
        "completed_count": batch.completed_count,
        "failed_count": batch.failed_count,
        "processing_count": batch.total_count
        - batch.completed_count
        - batch.failed_count,
        "receipts": [
            {
                "id": str(r.id),
                "filename": r.original_filename,
                "status": r.status,
                "merchant_name": r.merchant_name,
                "total_amount": r.total_amount,
                "currency": r.currency,
            }
            for r in receipts
        ],
    }


@router.get("/export")
def export_receipts(
    format: str = Query("excel", enum=["excel", "pdf"]),
    from_date: str = Query(None),
    to_date: str = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    from app.features.expenses.export import export_expenses_excel, export_expenses_pdf
    from fastapi.responses import StreamingResponse
    import io

    if format == "excel":
        file_bytes = export_expenses_excel(db, user_id, from_date, to_date)
        filename = f"receipts_{from_date or 'all'}_{to_date or 'today'}.xlsx"
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    else:
        file_bytes = export_expenses_pdf(db, user_id, from_date, to_date)
        filename = f"receipts_{from_date or 'all'}_{to_date or 'today'}.pdf"
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
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


@router.post("/{receipt_id}/retry", response_model=ReceiptResponse)
def retry_receipt(
    receipt_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    receipt = service.get_receipt_by_id(db, receipt_id, user_id)
    if receipt.status != "failed":
        raise HTTPException(
            status_code=400, detail="Only failed receipts can be retried"
        )
    return service.retry_receipt(db, receipt)


@router.delete("/{receipt_id}", status_code=200)
def delete_receipt(
    receipt_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.delete_receipt(db, receipt_id, user_id)
