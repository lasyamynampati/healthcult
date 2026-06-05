from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PatientCreateRequest(BaseModel):
    user_id: UUID | None = None
    clinician_owner_id: UUID | None = None
    external_ref: str | None = Field(default=None, max_length=80)


class PatientResponse(BaseModel):
    id: UUID
    user_id: UUID | None
    clinician_owner_id: UUID | None
    external_ref: str | None
    created_at: datetime
    updated_at: datetime


class RiskAssessmentCreateRequest(BaseModel):
    patient_id: UUID
    model_type: str = Field(min_length=1, max_length=30)
    model_version: str = Field(default="v1", max_length=30)
    input_snapshot: dict
    risk_score: float
    risk_band: str = Field(min_length=1, max_length=30)


class RiskAssessmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    model_type: str
    model_version: str
    input_snapshot: dict
    risk_score: float
    risk_band: str
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    # Counterfactual explanation (optional, included when available)
    counterfactual_suggestions: dict | None = None
    counterfactual_original_score: float | None = None
    counterfactual_improved_score: float | None = None
    counterfactual_non_actionable: list[str] | None = None


class ChatSessionCreateRequest(BaseModel):
    patient_id: UUID


class ChatSessionResponse(BaseModel):
    id: UUID
    patient_id: UUID
    started_at: datetime
    ended_at: datetime | None
    escalation_flag: bool
    created_at: datetime
    updated_at: datetime


class ChatMessageCreateRequest(BaseModel):
    sender: str = Field(min_length=1, max_length=30)
    content: str = Field(min_length=1, max_length=5000)


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    sender: str
    content: str
    safety_labels: dict
    created_at: datetime


class DocumentCreateRequest(BaseModel):
    patient_id: UUID
    storage_uri: str = Field(min_length=1, max_length=512)
    doc_type: str | None = Field(default=None, max_length=50)


class DocumentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    storage_uri: str
    doc_type: str | None
    status: str
    uploaded_at: datetime
    created_at: datetime
    updated_at: datetime

