from dataclasses import dataclass
from pathlib import Path
import pickle
from typing import Any


class ModelArtifactMissingError(FileNotFoundError):
    pass


@dataclass(frozen=True)
class ModelSpec:
    model_type: str
    filename: str
    feature_order: tuple[str, ...]


MODEL_SPECS: dict[str, ModelSpec] = {
    "diabetes": ModelSpec(
        model_type="diabetes",
        filename="diabetes_model.pkl",
        feature_order=(
            "pregnancies",
            "glucose",
            "blood_pressure",
            "skin_thickness",
            "insulin",
            "bmi",
            "diabetes_pedigree_function",
            "age",
        ),
    ),
    "heart": ModelSpec(
        model_type="heart",
        filename="heart_model.pkl",
        feature_order=(
            "age",
            "sex",
            "cp",
            "trestbps",
            "chol",
            "fbs",
            "restecg",
            "thalach",
            "exang",
            "oldpeak",
            "slope",
            "ca",
            "thal",
        ),
    ),
}


_MODEL_CACHE: dict[str, dict[str, Any]] = {}


def _candidate_paths(filename: str) -> list[Path]:
    backend_root = Path(__file__).resolve().parents[2]
    repo_root = backend_root.parent
    return [
        backend_root / "app" / "ml" / "artifacts" / filename,
        repo_root / "ml" / "artifacts" / filename,
    ]


def load_model_bundle(model_type: str) -> dict[str, Any]:
    if model_type in _MODEL_CACHE:
        return _MODEL_CACHE[model_type]

    spec = MODEL_SPECS.get(model_type)
    if spec is None:
        raise ValueError(f"Unsupported model_type: {model_type}")

    for path in _candidate_paths(spec.filename):
        if path.exists():
            with path.open("rb") as f:
                bundle = pickle.load(f)
            if not isinstance(bundle, dict) or "model" not in bundle:
                raise ValueError(f"Invalid model bundle format for {model_type}: {path}")
            _MODEL_CACHE[model_type] = bundle
            return bundle

    searched = ", ".join(str(p) for p in _candidate_paths(spec.filename))
    raise ModelArtifactMissingError(
        f"Missing artifact for {model_type}. Expected one of: {searched}"
    )