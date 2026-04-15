## POST /auth/register, /auth/login, /auth/refresh, /auth/logout

import secrets
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user_id, get_current_admin
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
from app.shared.location import get_location_from_ip
from app.features.auth.models import User, UserActivity


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    return service.create_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    user = service.authenticate_user(db, payload.email, payload.password)

    # Capture login location
    ip = request.client.host
    location = get_location_from_ip(ip)
    activity = UserActivity(
        user_id=user.id,
        action="login",
        ip_address=location["ip"],
        country=location["country"],
        region=location["region"],
        city=location["city"],
    )
    db.add(activity)
    db.commit()

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


@router.get("/admin/activity")
def get_activity(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    activity = (
        db.query(UserActivity).order_by(UserActivity.created_at.desc()).limit(100).all()
    )
    return activity


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    service.verify_email(db, token)
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(payload: UserLogin, db: Session = Depends(get_db)):
    user = service.get_user_by_email(db, payload.email)
    if not user:
        raise UnprocessableError("No account found with this email")
    if user.is_verified:
        raise UnprocessableError("Email is already verified")
    token = secrets.token_urlsafe(32)
    user.verification_token = token
    db.commit()
    service.send_verification_email(user, token)
    return {"message": "Verification email sent"}
