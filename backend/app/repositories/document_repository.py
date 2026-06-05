from sqlalchemy.orm import Session

from app.models.models import Document


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, patient_id, storage_uri: str, doc_type: str | None = None) -> Document:
        doc = Document(patient_id=patient_id, storage_uri=storage_uri, doc_type=doc_type, status="uploaded")
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

