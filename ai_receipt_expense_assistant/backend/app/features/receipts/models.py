import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    batch_id = Column(
        UUID(as_uuid=True), ForeignKey("receipt_batches.id"), nullable=True, index=True
    )
    file_url = Column(String, nullable=True)
    original_filename = Column(String, nullable=False)
    status = Column(String, default="processing")
    merchant_name = Column(String, nullable=True)
    total_amount = Column(Float, nullable=True)
    currency = Column(String, default="NGN")
    receipt_date = Column(String, nullable=True)
    category = Column(String, nullable=True)
    line_items = Column(JSON, nullable=True)
    raw_extraction = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    model_used = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ReceiptBatch(Base):
    __tablename__ = "receipt_batches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    total_count = Column(Integer, nullable=False)
    completed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    status = Column(String, default="processing")  # processing, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
