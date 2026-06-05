from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Consent, User

router = APIRouter()


@router.get("/me")
def get_consents_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Consent).filter(Consent.user_id == current_user.id).all()
    return {"consents": [{"id": str(c.id), "purpose": c.purpose, "revoked_at": c.revoked_at} for c in items]}


@router.post("")
def create_consent(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consent = Consent(user_id=current_user.id, consent_type=payload.get("consent_type", "general"), purpose=payload.get("purpose", "risk_assessment"))
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return {"id": str(consent.id), "status": "granted"}


@router.delete("/{consent_id}")
def revoke_consent(consent_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    consent = db.query(Consent).filter(Consent.id == consent_id, Consent.user_id == current_user.id).first()
    if not consent:
        return {"consent_id": consent_id, "status": "not_found"}
    from datetime import datetime

    consent.revoked_at = datetime.utcnow()
    db.commit()
    return {"consent_id": consent_id, "status": "revoked"}
