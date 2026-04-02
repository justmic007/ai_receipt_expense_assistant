# ReceiptCreate, ReceiptResponse, ExtractedData

from pydantic import BaseModel, UUID4
from typing import Optional, List, Any
from datetime import datetime


class LineItem(BaseModel):
    name: str
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total: Optional[float] = None


class ExtractedData(BaseModel):
    merchant_name: Optional[str] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    receipt_date: Optional[str] = None
    category: Optional[str] = None
    line_items: Optional[List[LineItem]] = []


class ReceiptResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    original_filename: str
    status: str
    merchant_name: Optional[str]
    total_amount: Optional[float]
    currency: Optional[str]
    receipt_date: Optional[str]
    category: Optional[str]
    line_items: Optional[List[Any]]
    error_message: Optional[str]
    model_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReceiptListResponse(BaseModel):
    total: int
    items: List[ReceiptResponse]
