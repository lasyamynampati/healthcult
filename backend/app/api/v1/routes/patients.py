from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.repositories.patient_repository import PatientRepository
from app.schemas.core import PatientCreateRequest, PatientResponse

router = APIRouter()


@router.post("", response_model=PatientResponse)
def create_patient(
    payload: PatientCreateRequest,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient_repository = PatientRepository(db)
    if payload.user_id:
        existing = patient_repository.get_by_user_id(payload.user_id)
        if existing:
            patient = existing
        else:
            patient = patient_repository.create(
                user_id=payload.user_id,
                clinician_owner_id=payload.clinician_owner_id,
                external_ref=payload.external_ref,
            )
    else:
        patient = patient_repository.create(
            user_id=payload.user_id,
            clinician_owner_id=payload.clinician_owner_id,
            external_ref=payload.external_ref,
        )

    return PatientResponse(
        id=patient.id,
        user_id=patient.user_id,
        clinician_owner_id=patient.clinician_owner_id,
        external_ref=patient.external_ref,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
    )


@router.get("/user/{user_id}", response_model=PatientResponse)
def get_patient_by_user(
    user_id: UUID,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = PatientRepository(db).get_by_user_id(user_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(
        id=patient.id,
        user_id=patient.user_id,
        clinician_owner_id=patient.clinician_owner_id,
        external_ref=patient.external_ref,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
    )

