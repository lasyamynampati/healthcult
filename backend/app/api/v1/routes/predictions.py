from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.repositories.counterfactual_repository import CounterfactualRepository
from app.repositories.risk_assessment_repository import RiskAssessmentRepository
from app.schemas.core import RiskAssessmentResponse
from app.schemas.prediction import (
    CounterfactualGenerateRequest,
    CounterfactualRunResponse,
    DiabetesPredictionRequest,
    HeartPredictionRequest,
)
from app.services.counterfactual_service import generate_counterfactual
from app.services.prediction_service import ModelArtifactMissingError, run_prediction

router = APIRouter()


def _persist_prediction(
    *,
    model_type: str,
    patient_id,
    features: dict,
    current_user: User,
    db: Session,
) -> RiskAssessmentResponse:
    try:
        output = run_prediction(model_type=model_type, features=features)
    except ModelArtifactMissingError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    assessment = RiskAssessmentRepository(db).create(
        patient_id=patient_id,
        model_type=output.model_type,
        model_version=output.model_version,
        input_snapshot=output.input_snapshot,
        risk_score=output.risk_score,
        risk_band=output.risk_band,
        created_by=current_user.id,
    )

    # Generate model-aware counterfactual explanation and persist it
    cf_suggestions = None
    cf_original = None
    cf_improved = None
    try:
        cf_result = generate_counterfactual(
            assessment_id=assessment.id,
            model_type=model_type,
            input_snapshot=output.input_snapshot,
        )
        cf_suggestions = cf_result.suggestions
        cf_original = cf_result.original_score
        cf_improved = cf_result.improved_score

        CounterfactualRepository(db).create(
            id=cf_result.run_id,
            assessment_id=assessment.id,
            target_outcome=cf_result.target_outcome,
            suggestions=cf_result.suggestions,
            feasibility_score=cf_result.feasibility_score,
        )
    except Exception:
        pass  # Counterfactual is best-effort; don't break prediction

    return RiskAssessmentResponse(
        id=assessment.id,
        patient_id=assessment.patient_id,
        model_type=assessment.model_type,
        model_version=assessment.model_version,
        input_snapshot=assessment.input_snapshot,
        risk_score=assessment.risk_score,
        risk_band=assessment.risk_band,
        created_by=assessment.created_by,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        counterfactual_suggestions=cf_suggestions,
        counterfactual_original_score=cf_original,
        counterfactual_improved_score=cf_improved,
        counterfactual_non_actionable=cf_result.notes if cf_result else None,
    )


@router.post("/diabetes", response_model=RiskAssessmentResponse)
def predict_diabetes(
    payload: DiabetesPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _persist_prediction(
        model_type="diabetes",
        patient_id=payload.patient_id,
        features=payload.features.model_dump(),
        current_user=current_user,
        db=db,
    )


@router.post("/heart", response_model=RiskAssessmentResponse)
def predict_heart(
    payload: HeartPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _persist_prediction(
        model_type="heart",
        patient_id=payload.patient_id,
        features=payload.features.model_dump(),
        current_user=current_user,
        db=db,
    )


@router.get("/history/{patient_id}")
def prediction_history(
    patient_id: UUID,
    db: Session = Depends(get_db),
    _u: User = Depends(get_current_user),
):
    items = RiskAssessmentRepository(db).list_by_patient(patient_id)
    return {
        "items": [
            {
                "id": str(i.id),
                "model_type": i.model_type,
                "model_version": i.model_version,
                "risk_score": i.risk_score,
                "risk_band": i.risk_band,
                "created_at": i.created_at,
            }
            for i in items
        ]
    }


@router.get("/history/user/{user_id}")
def prediction_history_by_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    items = RiskAssessmentRepository(db).list_by_user(user_id)
    return {
        "items": [
            {
                "id": str(i.id),
                "model_type": i.model_type,
                "model_version": i.model_version,
                "risk_score": i.risk_score,
                "risk_band": i.risk_band,
                "created_at": i.created_at,
            }
            for i in items
        ]
    }


@router.get("/counterfactuals/user/{user_id}")
def counterfactual_history_by_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    items = CounterfactualRepository(db).list_by_user(user_id)
    return {
        "items": [
            {
                "id": str(item.id),
                "assessment_id": str(item.assessment_id),
                "target_outcome": item.target_outcome,
                "suggestions": item.suggestions,
                "feasibility_score": item.feasibility_score,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "model_type": item.assessment.model_type if item.assessment else None,
                "model_version": item.assessment.model_version if item.assessment else None,
                "risk_score": item.assessment.risk_score if item.assessment else None,
                "risk_band": item.assessment.risk_band if item.assessment else None,
            }
            for item in items
        ]
    }


@router.post("/{assessment_id}/counterfactuals", response_model=CounterfactualRunResponse)
def create_counterfactual(
    assessment_id: UUID,
    payload: CounterfactualGenerateRequest,
    _u: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = RiskAssessmentRepository(db).get_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found")

    result = generate_counterfactual(
        assessment_id=assessment_id,
        target_outcome=payload.target_outcome,
        max_suggestions=payload.max_suggestions,
    )

    persisted = CounterfactualRepository(db).create(
        id=result.run_id,
        assessment_id=assessment_id,
        target_outcome=result.target_outcome,
        suggestions=result.suggestions,
        feasibility_score=result.feasibility_score,
    )

    return CounterfactualRunResponse(
        id=persisted.id,
        assessment_id=persisted.assessment_id,
        target_outcome=persisted.target_outcome,
        suggestions=persisted.suggestions,
        feasibility_score=persisted.feasibility_score,
        created_at=persisted.created_at,
        updated_at=persisted.updated_at,
    )