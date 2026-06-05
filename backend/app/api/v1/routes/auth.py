from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(UserRepository(db), db)
    try:
        user = service.register(payload.email, payload.password, payload.role)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(UserRepository(db), db)
    try:
        user = service.authenticate(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/refresh", response_model=TokenResponse)
def refresh(current_user: User = Depends(get_current_user)):
    return TokenResponse(access_token=create_access_token(str(current_user.id)))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_current_user: User = Depends(get_current_user)):
    # Stateless JWT architecture: client must discard token.
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    AuthService(UserRepository(db), db).request_password_reset(payload.email)
    return ForgotPasswordResponse(message="If the account exists, reset instructions have been initiated.")
