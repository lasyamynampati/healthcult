import os
import pickle
from pathlib import Path
from sklearn.linear_model import LogisticRegression
import numpy as np

# Features matching the exact order from `model_loader.py`
DIABETES_FEATURES = (
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
    "diabetes_pedigree_function",
    "age",
)

HEART_FEATURES = (
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
)

def generate_placeholder_model(feature_count: int) -> LogisticRegression:
    """
    Creates a simple baseline LogisticRegression model and fits it on random dummy data.
    IMPORTANT: This is a TEMPORARY placeholder model used ONLY for end-to-end backend validation.
    It does not contain real clinical predictive power and MUST be replaced before production use.
    """
    # Create random dummy data to initialize the model
    X = np.random.rand(100, feature_count)
    y = np.random.randint(0, 2, 100)
    
    model = LogisticRegression()
    model.fit(X, y)
    return model

def main():
    print("Generating temporary baseline ML artifacts...")
    
    # Ensure artifacts directory exists
    repo_root = Path(__file__).resolve().parents[2]
    artifacts_dir = repo_root / "ml" / "artifacts"
    os.makedirs(artifacts_dir, exist_ok=True)
    
    # 1. Diabetes Model
    diabetes_model = generate_placeholder_model(len(DIABETES_FEATURES))
    diabetes_bundle = {
        "model": diabetes_model,
        "model_version": "v1-baseline-placeholder",
        "features": DIABETES_FEATURES,
        "description": "TEMPORARY PLACEHOLDER - Replace with real trained model."
    }
    
    diabetes_path = artifacts_dir / "diabetes_model.pkl"
    with open(diabetes_path, "wb") as f:
        pickle.dump(diabetes_bundle, f)
    print(f"Saved dummy diabetes model to {diabetes_path}")
    
    # 2. Heart Model
    heart_model = generate_placeholder_model(len(HEART_FEATURES))
    heart_bundle = {
        "model": heart_model,
        "model_version": "v1-baseline-placeholder",
        "features": HEART_FEATURES,
        "description": "TEMPORARY PLACEHOLDER - Replace with real trained model."
    }
    
    heart_path = artifacts_dir / "heart_model.pkl"
    with open(heart_path, "wb") as f:
        pickle.dump(heart_bundle, f)
    print(f"Saved dummy heart model to {heart_path}")
    
    print("\nDONE. These artifacts allow backend tests and endpoints to return 200 OK.")
    print("Please ensure these placeholder .pkl files are NOT used for real clinical inferences.")

if __name__ == "__main__":
    main()
