## GET /expenses, GET /expenses/summary, PATCH /expenses/{id}
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user_id
from app.features.expenses import service
from app.features.expenses.schemas import (
    ExpenseResponse,
    ExpenseUpdate,
    ExpenseListResponse,
    SpendSummary,
)

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=ExpenseListResponse)
def list_expenses(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    expenses = service.get_user_expenses(db, user_id)
    total_amount = sum(e.amount for e in expenses)
    return ExpenseListResponse(
        total=len(expenses),
        total_amount=total_amount,
        items=expenses,
    )


@router.get("/summary", response_model=SpendSummary)
def get_summary(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.get_spend_summary(db, user_id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.get_expense_by_id(db, expense_id, user_id)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.update_expense(db, expense_id, user_id, payload)
