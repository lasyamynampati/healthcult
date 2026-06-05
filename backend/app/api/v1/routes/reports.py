from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.repositories.document_repository import DocumentRepository
from app.schemas.core import DocumentCreateRequest, DocumentResponse

router = APIRouter()


@router.post("", response_model=DocumentResponse)
def create_document(
    payload: DocumentCreateRequest,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = DocumentRepository(db).create(patient_id=payload.patient_id, storage_uri=payload.storage_uri, doc_type=payload.doc_type)
    return DocumentResponse(
        id=doc.id,
        patient_id=doc.patient_id,
        storage_uri=doc.storage_uri,
        doc_type=doc.doc_type,
        status=doc.status,
        uploaded_at=doc.uploaded_at,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.post("/{document_id}/ocr")
def run_ocr(document_id: str, _current_user: User = Depends(get_current_user)):
    return {"document_id": document_id, "status": "queued"}


@router.get("/{document_id}/ocr")
def get_ocr(document_id: str, _current_user: User = Depends(get_current_user)):
    return {"document_id": document_id, "status": "completed"}


@router.patch("/{document_id}/entities")
def patch_entities(document_id: str, payload: dict, _current_user: User = Depends(get_current_user)):
    return {"document_id": document_id, "entities": payload.get("entities", [])}


@router.get("/history")
def reports_history(_current_user: User = Depends(get_current_user)):
    return {"items": []}
