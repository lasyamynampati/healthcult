import os
import pickle
from pathlib import Path
import pandas as pd
import numpy as np

from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score

# Output constraints
DIABETES_FEATURES = (
    "pregnancies", "glucose", "blood_pressure", "skin_thickness",
    "insulin", "bmi", "diabetes_pedigree_function", "age",
)

HEART_FEATURES = (
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal",
)

def train_diabetes_model(artifacts_dir: Path):
    print("\n--- Training Diabetes Model (Pima Indians) ---")
    
    # Fetch from OpenML
    print("Fetching dataset...")
    data = fetch_openml(name='diabetes', version=1, as_frame=True, parser='auto')
    df = data.frame
    
    # OpenML columns: preg, plas, pres, skin, insu, mass, pedi, age
    rename_map = {
        'preg': 'pregnancies',
        'plas': 'glucose',
        'pres': 'blood_pressure',
        'skin': 'skin_thickness',
        'insu': 'insulin',
        'mass': 'bmi',
        'pedi': 'diabetes_pedigree_function',
        'age': 'age'
    }
    df = df.rename(columns=rename_map)
    
    # Target: 'tested_positive' -> 1, 'tested_negative' -> 0
    df['target'] = df['class'].apply(lambda x: 1 if x == 'tested_positive' else 0)
    
    X = df[list(DIABETES_FEATURES)]
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Build pipeline: Imputer -> Scaler -> LogisticRegression
    pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(random_state=42, max_iter=1000))
    ])
    
    print("Training model pipeline...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    
    print(f"Validation Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Validation ROC-AUC:  {roc_auc_score(y_test, y_prob):.4f}")
    
    # Save artifact
    bundle = {
        "model": pipeline,
        "model_version": "v1.0.0-real",
        "features": DIABETES_FEATURES,
        "description": "Real Clinical LogisticRegression Model (Pima Indians Dataset)"
    }
    path = artifacts_dir / "diabetes_model.pkl"
    with open(path, "wb") as f:
        pickle.dump(bundle, f)
    print(f"Saved artifact to {path}")

def train_heart_model(artifacts_dir: Path):
    print("\n--- Training Heart Disease Model (UCI Cleveland) ---")
    
    # Fetch from UCI directly as CSV
    print("Fetching dataset...")
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
    columns = [
        "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
        "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"
    ]
    df = pd.read_csv(url, names=columns, na_values="?")
    
    # Target: 0 = no disease, 1-4 = presence. Map to binary classification.
    df['target'] = df['target'].apply(lambda x: 1 if x > 0 else 0)
    
    X = df[list(HEART_FEATURES)]
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Build pipeline: Imputer (handles `ca` and `thal` NaNs) -> Scaler -> LogisticRegression
    pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(random_state=42, max_iter=1000))
    ])
    
    print("Training model pipeline...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    
    print(f"Validation Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Validation ROC-AUC:  {roc_auc_score(y_test, y_prob):.4f}")
    
    # Save artifact
    bundle = {
        "model": pipeline,
        "model_version": "v1.0.0-real",
        "features": HEART_FEATURES,
        "description": "Real Clinical LogisticRegression Model (UCI Cleveland Dataset)"
    }
    path = artifacts_dir / "heart_model.pkl"
    with open(path, "wb") as f:
        pickle.dump(bundle, f)
    print(f"Saved artifact to {path}")

def main():
    repo_root = Path(__file__).resolve().parents[2]
    artifacts_dir = repo_root / "ml" / "artifacts"
    os.makedirs(artifacts_dir, exist_ok=True)
    
    print("Starting ML Training Pipeline")
    train_diabetes_model(artifacts_dir)
    train_heart_model(artifacts_dir)
    print("\nTraining Complete! The real artifacts have replaced the placeholders.")

if __name__ == "__main__":
    main()
