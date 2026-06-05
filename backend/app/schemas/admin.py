from pydantic import BaseModel


class AdminOverviewResponse(BaseModel):
    users: int
    auth_enabled: bool


class AdminUpdateRoleRequest(BaseModel):
    role: str
