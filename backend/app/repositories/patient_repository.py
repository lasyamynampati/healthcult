from sqlalchemy.orm import Session

from app.models.models import Patient


class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id=None, clinician_owner_id=None, external_ref: str | None = None) -> Patient:
        patient = Patient(user_id=user_id, clinician_owner_id=clinician_owner_id, external_ref=external_ref)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def get_by_user_id(self, user_id) -> Patient | None:
        return (
            self.db.query(Patient)
            .filter(Patient.user_id == user_id)
            .order_by(Patient.created_at.desc())
            .first()
        )

