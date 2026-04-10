## business logic: create_user, authenticate_user

import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings
from sqlalchemy.orm import Session
from app.features.auth.models import User
from app.features.auth.schemas import UserRegister
from app.core.security import hash_password, verify_password
from app.shared.exceptions import ConflictError, NotFoundError, UnprocessableError


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User")
    return user


def create_user(db: Session, payload: UserRegister) -> User:
    if get_user_by_email(db, payload.email):
        raise ConflictError("A user with this email already exists")

    token = secrets.token_urlsafe(32)
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        is_active=False,
        is_verified=False,
        verification_token=token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Verify your ReceiptAI account"
    msg["From"] = f"ReceiptAI <{settings.GMAIL_USER}>"
    msg["To"] = user.email
    msg.attach(
        MIMEText(
            f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #0f172a;">Verify your email</h2>
            <p style="color: #475569;">Hi {user.full_name or 'there'}, click the button below to verify your account.</p>
            <a href="{verify_url}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
                Verify Email
            </a>
            <p style="color:#94a3b8;font-size:12px;">If you didn't create an account, ignore this email.</p>
        </div>
    """,
            "html",
        )
    )
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(settings.GMAIL_USER, user.email, msg.as_string())
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise NotFoundError("Invalid email or password")
    if not user.is_verified:
        raise UnprocessableError("Please verify your email before logging in")
    return user


def verify_email(db: Session, token: str) -> User:
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise UnprocessableError("Invalid or expired verification token")
    user.is_active = True
    user.is_verified = True
    user.verification_token = None
    db.commit()
    db.refresh(user)
    return user
