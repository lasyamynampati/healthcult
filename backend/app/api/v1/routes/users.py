from fastapi import APIRouter, Depends
from datetime import datetime

from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.auth import UserMeResponse

router = APIRouter()

@router.get("/me", response_model=UserMeResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserMeResponse(
        id=str(current_user.id),
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at or datetime.now(),
    )
