import httpx
import json

client = httpx.Client(base_url="http://127.0.0.1:8005", timeout=30)

# Login
r = client.post("/api/v1/auth/login", json={"email": "smoketest@example.com", "password": "StrongPassword123!"})
token = r.json()["access_token"]
client.headers["Authorization"] = f"Bearer {token}"

# Get patient
me = client.get("/api/v1/users/me").json()
r = client.post("/api/v1/patients", json={"user_id": me["id"], "external_ref": "CF-TEST"})
if r.status_code == 400:
    r = client.get(f"/api/v1/patients/user/{me['id']}")
pid = r.json()["id"]

# Diabetes prediction
payload = {
    "patient_id": pid,
    "features": {
        "pregnancies": 2, "glucose": 140, "blood_pressure": 80,
        "skin_thickness": 25, "insulin": 100, "bmi": 30.5,
        "diabetes_pedigree_function": 0.5, "age": 50,
    },
}
r = client.post("/api/v1/predictions/diabetes", json=payload)
d = r.json()
print("=== DIABETES RESPONSE ===")
print(f"risk_score: {d['risk_score']}")
print(f"risk_band: {d['risk_band']}")
print(f"counterfactual_suggestions: {d.get('counterfactual_suggestions')}")
print(f"counterfactual_original_score: {d.get('counterfactual_original_score')}")
print(f"counterfactual_improved_score: {d.get('counterfactual_improved_score')}")

# Heart prediction
payload2 = {
    "patient_id": pid,
    "features": {
        "age": 55, "sex": 1, "cp": 2, "trestbps": 130, "chol": 250,
        "fbs": 0, "restecg": 0, "thalach": 140, "exang": 0,
        "oldpeak": 1.5, "slope": 1, "ca": 1, "thal": 6,
    },
}
r2 = client.post("/api/v1/predictions/heart", json=payload2)
d2 = r2.json()
print()
print("=== HEART RESPONSE ===")
print(f"risk_score: {d2['risk_score']}")
print(f"risk_band: {d2['risk_band']}")
print(f"counterfactual_suggestions: {d2.get('counterfactual_suggestions')}")
print(f"counterfactual_original_score: {d2.get('counterfactual_original_score')}")
print(f"counterfactual_improved_score: {d2.get('counterfactual_improved_score')}")
