# SQLAlchemy Expense model (FK to receipts)

import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    receipt_id = Column(UUID(as_uuid=True), ForeignKey("receipts.id"), nullable=True)
    merchant_name = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="NGN")
    category = Column(String, nullable=True)
    expense_date = Column(String, nullable=True)
    note = Column(String, nullable=True)
    is_reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Expense {self.merchant_name} {self.amount}>"
