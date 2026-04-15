## business logic: create_user, authenticate_user

import secrets
import httpx
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


def send_verification_email(user: User, token: str):
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    first_name = user.full_name.split()[0] if user.full_name else "there"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

              <!-- Header -->
              <tr>
                <td style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td style="background:#2563eb;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                        <span style="color:white;font-size:18px;font-weight:700;">R</span>
                      </td>
                      <td style="padding-left:10px;">
                        <span style="color:white;font-size:18px;font-weight:700;letter-spacing:-0.02em;">ReceiptAI</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">Verify your email</h1>
                  <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                    Hi {first_name}, thanks for signing up for ReceiptAI. Click the button below to verify your email address and activate your account.
                  </p>

                  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                    <tr>
                      <td style="background:#2563eb;border-radius:8px;">
                        <a href="{verify_url}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin:0;font-size:12px;color:#2563eb;word-break:break-all;">
                    {verify_url}
                  </p>

                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">

                  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                    This link expires in 24 hours. If you didn't create a ReceiptAI account, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#94a3b8;">
                    © 2026 ReceiptAI · AI-powered expense tracking
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    response = httpx.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": settings.BREVO_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "sender": {"name": "ReceiptAI", "email": settings.GMAIL_USER},
            "to": [{"email": user.email, "name": user.full_name or user.email}],
            "subject": "Verify your ReceiptAI account",
            "htmlContent": html,
        },
    )
    response.raise_for_status()


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

    send_verification_email(user, token)
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
