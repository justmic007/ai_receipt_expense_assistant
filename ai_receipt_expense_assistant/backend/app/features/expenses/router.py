## GET /expenses, GET /expenses/summary, PATCH /expenses/{id}
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user_id
from app.features.expenses import service
from app.features.expenses.export import export_expenses_excel, export_expenses_pdf
from app.features.expenses.schemas import (
    ExpenseResponse,
    ExpenseUpdate,
    ExpenseListResponse,
    SpendSummary,
)
import io

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


@router.get("/export")
def export_expenses(
    format: str = Query("excel", enum=["excel", "pdf"]),
    from_date: str = Query(None),
    to_date: str = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if format == "excel":
        file_bytes = export_expenses_excel(db, user_id, from_date, to_date)
        filename = f"expenses_{from_date or 'all'}_{to_date or 'today'}.xlsx"
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    else:
        file_bytes = export_expenses_pdf(db, user_id, from_date, to_date)
        filename = f"expenses_{from_date or 'all'}_{to_date or 'today'}.pdf"
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )


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


@router.delete("/{expense_id}", status_code=200)
def delete_expense(
    expense_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.delete_expense(db, expense_id, user_id)
