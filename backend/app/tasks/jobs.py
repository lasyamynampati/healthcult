from app.tasks.celery_app import celery


from app.tasks.celery_app import celery
from app.db.session import get_db
from app.models.models import Document, OCRJob, ReportEntity
from app.services.ocr_utils import extract_text_from_file, parse_medical_entities
from datetime import datetime


def process_ocr_task(db, document_id: str):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return None

    ocr_job = (
        db.query(OCRJob)
        .filter(OCRJob.document_id == document_id)
        .order_by(OCRJob.created_at.desc())
        .first()
    )
    if not ocr_job:
        return None

    ocr_job.status = "processing"
    db.commit()

    try:
        raw_text = extract_text_from_file(document.storage_uri)
        parsed, confidence, entities = parse_medical_entities(raw_text)

        ocr_job.raw_text = raw_text
        ocr_job.parsed = parsed
        ocr_job.confidence = confidence
        ocr_job.status = "completed"
        ocr_job.completed_at = datetime.utcnow()

        document.status = "processed"

        db.add(ocr_job)
        db.add(document)

        for entity in entities:
            report_entity = ReportEntity(
                document_id=document.id,
                entity_type=entity["entity_type"],
                entity_name=entity["entity_name"],
                value=str(entity["value"]),
                unit=entity["unit"],
                reference_range=entity["reference_range"],
                confidence=entity["confidence"],
            )
            db.add(report_entity)

        db.commit()
        return ocr_job
    except Exception as e:
        ocr_job.status = "failed"
        db.commit()
        raise e


@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def run_ocr_task(self, document_id: str):
    db = next(get_db())
    try:
        result = process_ocr_task(db, document_id)
        return {"document_id": document_id, "status": "completed" if result else "failed"}
    except Exception as e:
        self.retry(countdown=60 * (self.request.retries + 1))
        return {"document_id": document_id, "status": "retry", "error": str(e)}
    finally:
        db.close()


@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def run_prediction_batch(self, model_type: str):
    return {"model_type": model_type, "status": "processed"}


@celery.task
def build_analytics_snapshots():
    return {"status": "ok"}


@celery.task
def retention_cleanup():
    return {"status": "ok"}
