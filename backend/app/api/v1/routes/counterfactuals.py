from fastapi import APIRouter

from app.services.counterfactual_service import generate_counterfactual

router = APIRouter()


@router.post("/{assessment_id}")
def create_counterfactual(assessment_id: str):
    return generate_counterfactual(assessment_id)


@router.get("/{run_id}")
def get_counterfactual(run_id: str):
    return {"run_id": run_id, "status": "available"}
