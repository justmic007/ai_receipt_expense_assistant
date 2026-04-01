## business logic: create_user, authenticate_user

from sqlalchemy.orm import Session
from app.features.auth.models import User
from app.features.auth.schemas import UserRegister
from app.core.security import hash_password, verify_password
from app.shared.exceptions import ConflictError, NotFoundError


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

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise NotFoundError("Invalid email or password")
    return user
