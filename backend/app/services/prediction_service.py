from dataclasses import dataclass
from typing import Any

from app.ml.model_loader import MODEL_SPECS, ModelArtifactMissingError, load_model_bundle


@dataclass
class PredictionOutput:
    model_type: str
    model_version: str
    input_snapshot: dict[str, Any]
    risk_score: float
    risk_band: str


def _risk_band(score: float) -> str:
    if score < 0.33:
        return "low"
    if score < 0.66:
        return "moderate"
    return "high"


def _score_from_model(model: Any, feature_vector: list[float]) -> float:
    if hasattr(model, "predict_proba"):
        prob = model.predict_proba([feature_vector])[0]
        if len(prob) > 1:
            return float(prob[1])
        return float(prob[0])

    if hasattr(model, "predict"):
        pred = model.predict([feature_vector])[0]
        return float(pred)

    raise ValueError("Model must implement predict_proba() or predict()")


def run_prediction(model_type: str, features: dict[str, Any]) -> PredictionOutput:
    if model_type not in MODEL_SPECS:
        raise ValueError(f"Unsupported model_type: {model_type}")

    spec = MODEL_SPECS[model_type]
    bundle = load_model_bundle(model_type)
    model = bundle["model"]
    model_version = str(bundle.get("model_version", "v1"))

    feature_vector = [float(features[name]) for name in spec.feature_order]
    score = _score_from_model(model, feature_vector)
    score = max(0.0, min(1.0, score))

    return PredictionOutput(
        model_type=model_type,
        model_version=model_version,
        input_snapshot=dict(features),
        risk_score=score,
        risk_band=_risk_band(score),
    )


__all__ = ["PredictionOutput", "run_prediction", "ModelArtifactMissingError"]