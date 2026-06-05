from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    patient_id: UUID | None = None
    message: str = Field(min_length=1, max_length=2000)
    context_type: str | None = Field(default="general", max_length=50)
    assessment_id: UUID | None = None
    document_id: UUID | None = None


class ChatResponse(BaseModel):
    reply: str
    safe: bool
    escalated: bool
    escalation_reason: str | None = None
    disclaimer: str
    suggested_action: str | None = None
    created_at: datetime