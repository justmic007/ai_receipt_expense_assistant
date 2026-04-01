#  orchestrates: save file → call AI → store result

import uuid
from sqlalchemy.orm import Session
from app.features.receipts.models import Receipt
from app.features.receipts.ai_extractor import extract_receipt_data
from app.features.expenses.service import create_expense_from_receipt
from app.shared.exceptions import NotFoundError, ForbiddenError


def process_receipt(
    db: Session,
    user_id: str,
    file_bytes: bytes,
    filename: str,
    mime_type: str,
) -> Receipt:
    receipt = Receipt(
        user_id=uuid.UUID(user_id),
        original_filename=filename,
        status="processing",
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)

    result = extract_receipt_data(file_bytes, mime_type)

    if result["success"]:
        data = result["data"]
        receipt.status = "completed"
        receipt.merchant_name = data.get("merchant_name")
        receipt.total_amount = data.get("total_amount")
        receipt.currency = data.get("currency", "USD")
        receipt.receipt_date = data.get("receipt_date")
        receipt.category = data.get("category")
        receipt.line_items = data.get("line_items", [])
        receipt.raw_extraction = data
        db.commit()
        db.refresh(receipt)
        # Auto-create expense from receipt
        create_expense_from_receipt(db, receipt)
    else:
        receipt.status = "failed"

        db.commit()
        db.refresh(receipt)

    return receipt


def get_user_receipts(db: Session, user_id: str) -> list:
    return (
        db.query(Receipt)
        .filter(Receipt.user_id == uuid.UUID(user_id))
        .order_by(Receipt.created_at.desc())
        .all()
    )


def get_receipt_by_id(db: Session, receipt_id: str, user_id: str) -> Receipt:
    receipt = db.query(Receipt).filter(Receipt.id == uuid.UUID(receipt_id)).first()
    if not receipt:
        raise NotFoundError("Receipt")
    if str(receipt.user_id) != user_id:
        raise ForbiddenError()
    return receipt
