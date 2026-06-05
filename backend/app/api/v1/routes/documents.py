from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentUploadResponse, OCRJobResponse
from app.services.ocr_service import create_document_record, run_ocr_pipeline, save_uploaded_file

router = APIRouter(tags=["documents"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    patient_id: UUID = Form(...),
    doc_type: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    storage_uri = save_uploaded_file(content, file.filename)
    document = create_document_record(
        db=db,
        patient_id=patient_id,
        original_filename=file.filename,
        storage_uri=storage_uri,
        doc_type=doc_type,
    )

    background_tasks.add_task(run_ocr_pipeline, db, document.id)

    return document


@router.post("/{document_id}/ocr", response_model=OCRJobResponse)
def trigger_ocr(document_id: UUID, db: Session = Depends(get_db)):
    job = run_ocr_pipeline(db, document_id)
    if not job:
        raise HTTPException(status_code=404, detail="Document not found")
    return job


@router.get("/{document_id}/ocr", response_model=OCRJobResponse)
def get_ocr_result(document_id: UUID, db: Session = Depends(get_db)):
    from app.models.models import OCRJob

    job = (
        db.query(OCRJob)
        .filter(OCRJob.document_id == document_id)
        .order_by(OCRJob.created_at.desc())
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="OCR job not found")
    return job