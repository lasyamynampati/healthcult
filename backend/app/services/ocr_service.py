import uuid
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.models import Document, OCRJob
from app.services.ocr_utils import extract_text_from_file, parse_medical_entities
from app.tasks.jobs import run_ocr_task


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def save_uploaded_file(file_bytes: bytes, original_filename: str) -> str:
    extension = Path(original_filename).suffix or ".bin"
    safe_name = f"{uuid.uuid4()}{extension}"
    path = UPLOAD_DIR / safe_name
    path.write_bytes(file_bytes)
    return str(path)


def create_document_record(db: Session, patient_id, original_filename: str, storage_uri: str, doc_type: str | None):
    document = Document(
        patient_id=patient_id,
        storage_uri=storage_uri,
        doc_type=doc_type,
        status="uploaded",
        uploaded_at=datetime.utcnow(),
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def run_ocr_pipeline(db: Session, document_id):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return None

    ocr_job = OCRJob(
        document_id=document.id,
        task_id=str(uuid.uuid4()),
        status="queued",
        raw_text=None,
        parsed=None,
        confidence=None,
        completed_at=None,
    )
    db.add(ocr_job)
    db.commit()
    db.refresh(ocr_job)

    # Queue the OCR task
    task = run_ocr_task.delay(str(document_id))
    ocr_job.task_id = task.id
    db.commit()

    return ocr_job