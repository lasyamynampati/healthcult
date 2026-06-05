from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import Patient, RiskAssessment


class RiskAssessmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> RiskAssessment:
        obj = RiskAssessment(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get_by_id(self, assessment_id: UUID) -> RiskAssessment | None:
        return self.db.query(RiskAssessment).filter(RiskAssessment.id == assessment_id).first()

    def list_by_patient(self, patient_id: UUID) -> list[RiskAssessment]:
        return (
            self.db.query(RiskAssessment)
            .filter(RiskAssessment.patient_id == patient_id)
            .order_by(RiskAssessment.created_at.desc())
            .all()
        )

    def list_by_user(self, user_id: UUID) -> list[RiskAssessment]:
        return (
            self.db.query(RiskAssessment)
            .join(Patient)
            .filter(Patient.user_id == user_id)
            .order_by(RiskAssessment.created_at.desc())
            .all()
        )