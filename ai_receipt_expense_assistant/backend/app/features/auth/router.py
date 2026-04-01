## POST /auth/register, /auth/login, /auth/refresh, /auth/logout

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user_id
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.features.auth import service
from app.features.auth.schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshRequest,
)
from app.shared.exceptions import UnprocessableError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    return service.create_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = service.authenticate_user(db, payload.email, payload.password)
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest):
    user_id = decode_token(payload.refresh_token)
    if not user_id:
        raise UnprocessableError("Invalid or expired refresh token")
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.get_user_by_id(db, user_id)
