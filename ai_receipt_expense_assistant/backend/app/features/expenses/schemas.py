# ExpenseResponse, SpendSummary, CategoryEnum
from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime


class ExpenseResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    receipt_id: Optional[UUID4]
    merchant_name: Optional[str]
    amount: float
    currency: Optional[str]
    category: Optional[str]
    expense_date: Optional[str]
    note: Optional[str]
    is_reviewed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    note: Optional[str] = None
    is_reviewed: Optional[bool] = None


class ExpenseListResponse(BaseModel):
    total: int
    total_amount: float
    items: List[ExpenseResponse]


class CategorySummary(BaseModel):
    category: str
    total: float
    count: int


class SpendSummary(BaseModel):
    total_spent: float
    currency: str
    expense_count: int
    by_category: List[CategorySummary]
