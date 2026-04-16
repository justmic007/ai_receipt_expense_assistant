import threading
import time
import uuid
from sqlalchemy.orm import Session
from app.features.receipts.models import Receipt, ReceiptBatch
from app.features.receipts.ai_extractor import extract_receipt_data
from app.features.expenses.service import create_expense_from_receipt
from app.shared.exceptions import NotFoundError, ForbiddenError


def process_receipt(
    db: Session, user_id: str, file_bytes: bytes, filename: str, mime_type: str
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
        receipt.currency = data.get("currency", "NGN")
        receipt.receipt_date = data.get("receipt_date")
        receipt.category = data.get("category")
        receipt.line_items = data.get("line_items", [])
        receipt.raw_extraction = data
        receipt.error_message = None
        receipt.model_used = result.get("model")
        db.commit()
        db.refresh(receipt)
        create_expense_from_receipt(db, receipt)
    else:
        receipt.status = "failed"
        receipt.error_message = result.get("error", "AI extraction failed")
        db.commit()
        db.refresh(receipt)

    return receipt


def _process_batch_serially(
    batch_id: str, receipt_data_list: list, user_id: str, db_url: str
):
    """Runs in background thread — processes receipts one at a time."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        for i, (receipt_id, file_bytes, mime_type) in enumerate(receipt_data_list):
            receipt = (
                db.query(Receipt).filter(Receipt.id == uuid.UUID(receipt_id)).first()
            )
            if not receipt:
                continue

            print(
                f"Batch {batch_id}: processing receipt {i+1}/{len(receipt_data_list)}"
            )

            result = extract_receipt_data(file_bytes, mime_type)

            batch = (
                db.query(ReceiptBatch)
                .filter(ReceiptBatch.id == uuid.UUID(batch_id))
                .first()
            )

            if result["success"]:
                data = result["data"]
                receipt.status = "completed"
                receipt.merchant_name = data.get("merchant_name")
                receipt.total_amount = data.get("total_amount")
                receipt.currency = data.get("currency", "NGN")
                receipt.receipt_date = data.get("receipt_date")
                receipt.category = data.get("category")
                receipt.line_items = data.get("line_items", [])
                receipt.raw_extraction = data
                receipt.model_used = result.get("model")
                receipt.error_message = None
                if batch:
                    batch.completed_count += 1
                db.commit()
                db.refresh(receipt)
                create_expense_from_receipt(db, receipt)
            else:
                receipt.status = "failed"
                receipt.error_message = result.get("error")
                if batch:
                    batch.failed_count += 1
                db.commit()

            # 5s delay between receipts to respect rate limits
            if i < len(receipt_data_list) - 1:
                print(f"Batch {batch_id}: waiting 5s before next receipt...")
                time.sleep(5)

        # Mark batch complete
        batch = (
            db.query(ReceiptBatch)
            .filter(ReceiptBatch.id == uuid.UUID(batch_id))
            .first()
        )
        if batch:
            batch.status = "completed"
            db.commit()

    finally:
        db.close()


def create_batch(
    db: Session,
    user_id: str,
    files_data: list,
    db_url: str,
) -> ReceiptBatch:
    """
    files_data: list of (filename, file_bytes, mime_type) tuples
    """
    batch = ReceiptBatch(
        user_id=uuid.UUID(user_id),
        total_count=len(files_data),
        status="processing",
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    receipt_data_list = []
    for filename, file_bytes, mime_type in files_data:
        receipt = Receipt(
            user_id=uuid.UUID(user_id),
            batch_id=batch.id,
            original_filename=filename,
            status="queued",
        )
        db.add(receipt)
        db.commit()
        db.refresh(receipt)
        receipt_data_list.append((str(receipt.id), file_bytes, mime_type))

    # Start background thread for serial processing
    thread = threading.Thread(
        target=_process_batch_serially,
        args=(str(batch.id), receipt_data_list, user_id, db_url),
        daemon=True,
    )
    thread.start()

    return batch


def get_batch_status(db: Session, batch_id: str, user_id: str) -> ReceiptBatch:
    batch = (
        db.query(ReceiptBatch).filter(ReceiptBatch.id == uuid.UUID(batch_id)).first()
    )
    if not batch:
        raise NotFoundError("Batch")
    if str(batch.user_id) != user_id:
        raise ForbiddenError()
    return batch


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


def retry_receipt(db, receipt):
    receipt.status = "failed"
    receipt.error_message = "Retry requires file re-upload"
    db.commit()
    db.refresh(receipt)
    return receipt


def delete_receipt(db: Session, receipt_id: str, user_id: str) -> dict:
    """Delete a receipt and its associated expense(s)."""
    from app.features.expenses.models import Expense

    receipt = get_receipt_by_id(db, receipt_id, user_id)

    # Delete associated expenses
    expenses = db.query(Expense).filter(Expense.receipt_id == receipt.id).all()
    for expense in expenses:
        db.delete(expense)

    # Delete the receipt
    db.delete(receipt)
    db.commit()

    return {
        "message": "Receipt and associated expenses deleted successfully",
        "receipt_id": str(receipt.id),
    }
