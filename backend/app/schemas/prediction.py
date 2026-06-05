from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DiabetesFeatures(BaseModel):
    pregnancies: int = Field(ge=0, le=25)
    glucose: float = Field(ge=0, le=400)
    blood_pressure: float = Field(ge=0, le=250)
    skin_thickness: float = Field(ge=0, le=120)
    insulin: float = Field(ge=0, le=1200)
    bmi: float = Field(ge=0, le=100)
    diabetes_pedigree_function: float = Field(ge=0, le=10)
    age: int = Field(ge=1, le=120)


class DiabetesPredictionRequest(BaseModel):
    patient_id: UUID
    features: DiabetesFeatures


class HeartFeatures(BaseModel):
    age: int = Field(ge=1, le=120)
    sex: int = Field(ge=0, le=1)
    cp: int = Field(ge=0, le=3)
    trestbps: float = Field(ge=0, le=300)
    chol: float = Field(ge=0, le=700)
    fbs: int = Field(ge=0, le=1)
    restecg: int = Field(ge=0, le=2)
    thalach: float = Field(ge=0, le=300)
    exang: int = Field(ge=0, le=1)
    oldpeak: float = Field(ge=0, le=15)
    slope: int = Field(ge=0, le=2)
    ca: int = Field(ge=0, le=4)
    thal: int = Field(ge=0, le=7)


class HeartPredictionRequest(BaseModel):
    patient_id: UUID
    features: HeartFeatures


class ExplanationResponse(BaseModel):
    id: UUID
    assessment_id: UUID
    method: str
    explanation: dict
    generated_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CounterfactualGenerateRequest(BaseModel):
    target_outcome: str = Field(default="lower_risk", min_length=3, max_length=50)
    max_suggestions: int = Field(default=3, ge=1, le=10)


class CounterfactualRunResponse(BaseModel):
    id: UUID
    assessment_id: UUID
    target_outcome: str
    suggestions: dict
    feasibility_score: float
    notes: list[str] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}