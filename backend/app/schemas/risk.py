from typing import Any

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    patient_id: str
    features: dict[str, Any] = Field(default_factory=dict)


class PredictionResponse(BaseModel):
    assessment_id: str
    model_type: str
    risk_score: float
    risk_band: str


class CounterfactualResponse(BaseModel):
    run_id: str
    assessment_id: str
    target_outcome: str
    feasibility_score: float
    suggestions: dict[str, Any]
