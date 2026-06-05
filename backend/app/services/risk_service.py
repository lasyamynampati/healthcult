from app.services.prediction_service import ModelArtifactMissingError, PredictionOutput, run_prediction


def predict_risk(model_type: str, features: dict) -> PredictionOutput:
    return run_prediction(model_type=model_type, features=features)


__all__ = ["predict_risk", "ModelArtifactMissingError", "PredictionOutput"]
