# category logic, spend aggregation
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.features.expenses.models import Expense
from app.features.expenses.schemas import ExpenseUpdate
from app.features.receipts.models import Receipt
from app.shared.exceptions import NotFoundError, ForbiddenError


def create_expense_from_receipt(db: Session, receipt: Receipt) -> Expense:
    """Called automatically after a receipt is successfully processed."""
    if not receipt.total_amount:
        return None

    expense = Expense(
        user_id=receipt.user_id,
        receipt_id=receipt.id,
        merchant_name=receipt.merchant_name,
        amount=receipt.total_amount,
        currency=receipt.currency or "NGN",
        category=receipt.category,
        expense_date=receipt.receipt_date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def get_user_expenses(db: Session, user_id: str) -> list:
    return (
        db.query(Expense)
        .filter(Expense.user_id == uuid.UUID(user_id))
        .order_by(Expense.created_at.desc())
        .all()
    )


def get_expense_by_id(db: Session, expense_id: str, user_id: str) -> Expense:
    expense = db.query(Expense).filter(Expense.id == uuid.UUID(expense_id)).first()
    if not expense:
        raise NotFoundError("Expense")
    if str(expense.user_id) != user_id:
        raise ForbiddenError()
    return expense


def update_expense(
    db: Session, expense_id: str, user_id: str, payload: ExpenseUpdate
) -> Expense:
    expense = get_expense_by_id(db, expense_id, user_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


def get_spend_summary(db: Session, user_id: str) -> dict:
    expenses = get_user_expenses(db, user_id)

    if not expenses:
        return {
            "total_spent": 0,
            "currency": "NGN",
            "expense_count": 0,
            "by_category": [],
        }

    total_spent = sum(e.amount for e in expenses)
    currency = expenses[0].currency or "NGN"

    category_map = {}
    for e in expenses:
        cat = e.category or "Other"
        if cat not in category_map:
            category_map[cat] = {"total": 0, "count": 0}
        category_map[cat]["total"] += e.amount
        category_map[cat]["count"] += 1

    by_category = [
        {"category": cat, "total": vals["total"], "count": vals["count"]}
        for cat, vals in sorted(category_map.items(), key=lambda x: -x[1]["total"])
    ]

    return {
        "total_spent": total_spent,
        "currency": currency,
        "expense_count": len(expenses),
        "by_category": by_category,
    }
