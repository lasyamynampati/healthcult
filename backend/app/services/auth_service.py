import hashlib
import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.models import PasswordResetToken, User
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repository: UserRepository, db: Session):
        self.user_repository = user_repository
        self.db = db

    def register(self, email: str, password: str, role: str) -> User:
        existing = self.user_repository.get_by_email(email)
        if existing:
            raise ValueError("Email already exists")
        password_hash = hash_password(password)
        return self.user_repository.create(email=email, password_hash=password_hash, role=role)

    def authenticate(self, email: str, password: str) -> User:
        user = self.user_repository.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid credentials")
        if not user.is_active:
            raise ValueError("Inactive user")
        return user

    def request_password_reset(self, email: str) -> None:
        user = self.user_repository.get_by_email(email)
        if not user:
            return

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=30),
        )
        self.db.add(record)
        self.db.commit()
