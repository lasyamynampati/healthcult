from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import CounterfactualRun, Patient, RiskAssessment


class CounterfactualRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        id=None,
        assessment_id,
        target_outcome: str,
        suggestions: dict,
        feasibility_score: float,
    ) -> CounterfactualRun:
        obj = CounterfactualRun(
            id=id,
            assessment_id=assessment_id,
            target_outcome=target_outcome,
            suggestions=suggestions,
            feasibility_score=feasibility_score,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get_by_id(self, run_id):
        return self.db.query(CounterfactualRun).filter(CounterfactualRun.id == run_id).first()

    def list_by_assessment(self, assessment_id):
        return (
            self.db.query(CounterfactualRun)
            .filter(CounterfactualRun.assessment_id == assessment_id)
            .order_by(CounterfactualRun.created_at.desc())
            .all()
        )

    def list_by_user(self, user_id):
        return (
            self.db.query(CounterfactualRun)
            .join(RiskAssessment)
            .join(Patient)
            .filter(Patient.user_id == user_id)
            .order_by(CounterfactualRun.created_at.desc())
            .all()
        )
