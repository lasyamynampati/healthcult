from fastapi import APIRouter

router = APIRouter()


@router.get("/patient/{patient_id}")
def get_patient_analytics(patient_id: str):
    return {"patient_id": patient_id, "metrics": []}


@router.get("/cohorts")
def get_cohorts():
    return {"cohorts": []}
