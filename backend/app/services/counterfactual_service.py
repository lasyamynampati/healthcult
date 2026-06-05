from dataclasses import dataclass
from typing import Any
from uuid import UUID, uuid4

from app.ml.model_loader import MODEL_SPECS, load_model_bundle


@dataclass(frozen=True)
class CounterfactualRunResult:
    run_id: UUID
    assessment_id: UUID
    target_outcome: str
    feasibility_score: float
    suggestions: dict[str, Any]
    original_score: float
    improved_score: float
    notes: list[str] | None = None


# Features that a patient can realistically improve (non-immutable)
ACTIONABLE_FEATURES: dict[str, set[str]] = {
    "diabetes": {"glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"},
    "heart": {"trestbps", "chol", "thalach", "oldpeak", "fbs"},
}

# Features that are important to explain but are not modifiable directly
NON_ACTIONABLE_FEATURES: dict[str, set[str]] = {
    "diabetes": {"diabetes_pedigree_function"},
}

NON_ACTIONABLE_EXPLANATIONS: dict[str, str] = {
    "diabetes_pedigree_function": (
        "Family history may increase baseline risk, but it cannot be changed directly. "
        "Focus on modifiable factors such as glucose, BMI, blood pressure, diet, sleep, and physical activity."
    ),
}

# How much to nudge each feature toward a healthier value (direction + magnitude)
NUDGE_RULES: dict[str, tuple[str, float]] = {
    # Diabetes features
    "glucose": ("decrease", 15),
    "blood_pressure": ("decrease", 10),
    "skin_thickness": ("decrease", 5),
    "insulin": ("decrease", 20),
    "bmi": ("decrease", 2.0),
    # Heart features
    "trestbps": ("decrease", 10),
    "chol": ("decrease", 20),
    "thalach": ("increase", 10),       # higher max heart rate is healthier
    "oldpeak": ("decrease", 0.5),
    "fbs": ("decrease", 1),            # fasting blood sugar below 120 → 0
}


def _run_model(model_type: str, feature_dict: dict[str, float]) -> float:
    """Score a feature dict through the model and return risk probability."""
    spec = MODEL_SPECS[model_type]
    bundle = load_model_bundle(model_type)
    model = bundle["model"]
    vec = [float(feature_dict[name]) for name in spec.feature_order]
    prob = model.predict_proba([vec])[0]
    return float(prob[1]) if len(prob) > 1 else float(prob[0])


def generate_counterfactual(
    assessment_id: UUID,
    target_outcome: str = "reduce_risk_to_low",
    max_suggestions: int = 3,
    *,
    model_type: str | None = None,
    input_snapshot: dict[str, Any] | None = None,
) -> CounterfactualRunResult:
    """
    Generate a simple model-aware counterfactual explanation.
    If model_type and input_snapshot are provided, we actually re-run the model
    with small realistic nudges and report the improvement.
    Otherwise, fall back to static placeholder suggestions.
    """

    if model_type and input_snapshot and model_type in ACTIONABLE_FEATURES:
        return _model_aware_counterfactual(
            assessment_id=assessment_id,
            target_outcome=target_outcome,
            max_suggestions=max_suggestions,
            model_type=model_type,
            input_snapshot=input_snapshot,
        )

    # Fallback: static suggestions (legacy behavior)
    base = [("bmi", "-2.0"), ("glucose", "-15"), ("blood_pressure", "-10")]
    notes = None
    if model_type in NON_ACTIONABLE_FEATURES:
        notes = [NON_ACTIONABLE_EXPLANATIONS[feat] for feat in NON_ACTIONABLE_FEATURES[model_type] if feat in (input_snapshot or {})]
    return CounterfactualRunResult(
        run_id=uuid4(),
        assessment_id=assessment_id,
        target_outcome=target_outcome,
        feasibility_score=0.78,
        suggestions=dict(base[:max_suggestions]),
        original_score=0.0,
        improved_score=0.0,
        notes=notes or None,
    )


def _model_aware_counterfactual(
    *,
    assessment_id: UUID,
    target_outcome: str,
    max_suggestions: int,
    model_type: str,
    input_snapshot: dict[str, Any],
) -> CounterfactualRunResult:
    """Try nudging actionable features and report the best improvement."""
    actionable = ACTIONABLE_FEATURES.get(model_type, set())

    # Convert input_snapshot values to float
    features = {k: float(v) for k, v in input_snapshot.items()}
    original_score = _run_model(model_type, features)

    notes: list[str] = []
    for feat in NON_ACTIONABLE_FEATURES.get(model_type, set()):
        if feat in features:
            explanation = NON_ACTIONABLE_EXPLANATIONS.get(feat)
            if explanation:
                notes.append(explanation)

    # Score each individual nudge by its impact
    impacts: list[tuple[str, str, float, float]] = []  # (feature, suggestion_text, new_score, delta)
    for feat in actionable:
        if feat not in features or feat not in NUDGE_RULES:
            continue
        direction, magnitude = NUDGE_RULES[feat]
        trial = dict(features)
        if direction == "decrease":
            trial[feat] = max(0, trial[feat] - magnitude)
            suggestion_text = f"Reduce by {magnitude}"
        else:
            trial[feat] = trial[feat] + magnitude
            suggestion_text = f"Increase by {magnitude}"

        new_score = _run_model(model_type, trial)
        delta = original_score - new_score  # positive delta = improvement
        if delta > 0.001:  # only include if it actually helps
            impacts.append((feat, suggestion_text, new_score, delta))

    # Sort by impact descending and take top N
    impacts.sort(key=lambda x: x[3], reverse=True)
    top = impacts[:max_suggestions]

    # Apply all top suggestions together to get the combined improved score
    combined = dict(features)
    suggestions: dict[str, str] = {}
    for feat, suggestion_text, _, _ in top:
        direction, magnitude = NUDGE_RULES[feat]
        if direction == "decrease":
            combined[feat] = max(0, combined[feat] - magnitude)
        else:
            combined[feat] = combined[feat] + magnitude
        suggestions[feat] = suggestion_text

    improved_score = _run_model(model_type, combined) if suggestions else original_score

    feasibility = 0.85 if len(suggestions) <= 2 else (0.75 if len(suggestions) <= 4 else 0.65)

    return CounterfactualRunResult(
        run_id=uuid4(),
        assessment_id=assessment_id,
        target_outcome=target_outcome,
        feasibility_score=feasibility,
        suggestions=suggestions,
        original_score=round(original_score, 4),
        improved_score=round(improved_score, 4),
        notes=notes or None,
    )