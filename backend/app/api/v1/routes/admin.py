from fastapi import APIRouter, Depends

from app.api.deps import require_role
from app.models.models import User
from app.schemas.admin import AdminOverviewResponse, AdminUpdateRoleRequest

router = APIRouter()


@router.get("/overview", response_model=AdminOverviewResponse)
def overview(_current_user: User = Depends(require_role("admin"))):
    return AdminOverviewResponse(users=0, auth_enabled=True)


@router.get("/users")
def admin_users(_current_user: User = Depends(require_role("admin"))):
    return {"items": []}


@router.patch("/users/{user_id}/role")
def patch_user_role(
    user_id: str,
    payload: AdminUpdateRoleRequest,
    _current_user: User = Depends(require_role("admin")),
):
    return {"user_id": user_id, "role": payload.role}


@router.get("/models/metrics")
def model_metrics(_current_user: User = Depends(require_role("admin"))):
    return {"items": []}


@router.get("/audit-logs")
def audit_logs(_current_user: User = Depends(require_role("admin"))):
    return {"items": []}


@router.get("/queue-health")
def queue_health(_current_user: User = Depends(require_role("admin"))):
    return {"ocr_queue": "ok", "ml_queue": "ok", "analytics_queue": "ok", "compliance_queue": "ok"}
