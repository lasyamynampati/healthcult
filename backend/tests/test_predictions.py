import uuid

from app.models.models import Patient
from app.services.prediction_service import PredictionOutput
import app.api.v1.routes.predictions as predictions_routes


def _create_patient(db) -> str:
    patient = Patient(
        id=uuid.uuid4(),
        user_id=None,
        clinician_owner_id=None,
        external_ref="PRED-1",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return str(patient.id)


def test_diabetes_prediction_route(client, db, monkeypatch):
    monkeypatch.setattr(
        predictions_routes,
        "run_prediction",
        lambda model_type, features: PredictionOutput(
            model_type=model_type,
            model_version="diabetes-v1",
            input_snapshot=dict(features),
            risk_score=0.72,
            risk_band="high",
        ),
    )

    patient_id = _create_patient(db)
    response = client.post(
        "/api/v1/predictions/diabetes",
        json={
            "patient_id": patient_id,
            "features": {
                "pregnancies": 2,
                "glucose": 148,
                "blood_pressure": 72,
                "skin_thickness": 35,
                "insulin": 0,
                "bmi": 33.6,
                "diabetes_pedigree_function": 0.627,
                "age": 50,
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "diabetes"
    assert data["model_version"] == "diabetes-v1"
    assert data["risk_score"] == 0.72
    assert data["risk_band"] == "high"


def test_heart_prediction_route_and_history(client, db, monkeypatch):
    monkeypatch.setattr(
        predictions_routes,
        "run_prediction",
        lambda model_type, features: PredictionOutput(
            model_type=model_type,
            model_version="heart-v1",
            input_snapshot=dict(features),
            risk_score=0.31,
            risk_band="low",
        ),
    )

    patient_id = _create_patient(db)
    response = client.post(
        "/api/v1/predictions/heart",
        json={
            "patient_id": patient_id,
            "features": {
                "age": 63,
                "sex": 1,
                "cp": 3,
                "trestbps": 145,
                "chol": 233,
                "fbs": 1,
                "restecg": 0,
                "thalach": 150,
                "exang": 0,
                "oldpeak": 2.3,
                "slope": 0,
                "ca": 0,
                "thal": 1,
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "heart"
    assert data["risk_score"] == 0.31
    assert data["risk_band"] == "low"

    history = client.get(f"/api/v1/predictions/history/{patient_id}")
    assert history.status_code == 200
    assert len(history.json()["items"]) >= 1


def test_counterfactual_route(client, db, monkeypatch):
    monkeypatch.setattr(
        predictions_routes,
        "run_prediction",
        lambda model_type, features: PredictionOutput(
            model_type=model_type,
            model_version="diabetes-v1",
            input_snapshot=dict(features),
            risk_score=0.82,
            risk_band="high",
        ),
    )

    patient_id = _create_patient(db)
    prediction = client.post(
        "/api/v1/predictions/diabetes",
        json={
            "patient_id": patient_id,
            "features": {
                "pregnancies": 3,
                "glucose": 170,
                "blood_pressure": 80,
                "skin_thickness": 32,
                "insulin": 120,
                "bmi": 31.2,
                "diabetes_pedigree_function": 0.55,
                "age": 47,
            },
        },
    )

    assert prediction.status_code == 200
    assessment_id = prediction.json()["id"]

    response = client.post(
        f"/api/v1/predictions/{assessment_id}/counterfactuals",
        json={
            "target_outcome": "reduce_risk_to_low",
            "max_suggestions": 3,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["assessment_id"] == assessment_id
    assert data["target_outcome"] == "reduce_risk_to_low"
    assert "suggestions" in data
    assert "feasibility_score" in data


def test_counterfactual_missing_assessment(client):
    missing_id = str(uuid.uuid4())
    response = client.post(
        f"/api/v1/predictions/{missing_id}/counterfactuals",
        json={
            "target_outcome": "reduce_risk_to_low",
            "max_suggestions": 3,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Risk assessment not found"