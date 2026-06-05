from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    id: UUID
    patient_id: UUID
    storage_uri: str
    doc_type: str | None
    status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class OCRJobResponse(BaseModel):
    id: UUID
    document_id: UUID
    task_id: str | None
    status: str
    raw_text: str | None
    parsed: dict | None
    confidence: dict | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}