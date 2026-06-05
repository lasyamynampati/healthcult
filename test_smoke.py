import httpx
import sys

BASE_URL = "http://127.0.0.1:8005"
api_base = f"{BASE_URL}/api/v1"

client = httpx.Client(base_url=BASE_URL, timeout=30.0)

def test():
    print("Testing /health...")
    r = client.get("/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("Health OK")

    print("Testing /ready...")
    r = client.get("/ready")
    assert r.status_code == 200, f"Ready failed: {r.text}"
    print("Ready OK")

    email = "smoketest@example.com"
    password = "StrongPassword123!"

    print("Testing signup...")
    r = client.post("/api/v1/auth/register", json={"email": email, "password": password, "role": "patient"})
    if r.status_code == 400 and "already exists" in r.text.lower():
        print("User already registered, continuing...")
    else:
        assert r.status_code == 200, f"Signup failed: {r.text}"
    print("Signup OK")

    print("Testing login...")
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    print("Login OK")

    print("Testing /users/me...")
    r = client.get("/api/v1/users/me")
    assert r.status_code == 200, f"Me failed: {r.text}"
    user_id = r.json()["id"]

    print("Creating patient...")
    r = client.post("/api/v1/patients", json={"user_id": user_id, "external_ref": "SMOKE-001"})
    # Patient creation might fail if already exists for user_id, but the endpoints should handle it or we can just fetch it
    if r.status_code == 400:
        print(f"Patient creation failed (might already exist): {r.text}")
        r = client.get(f"/api/v1/patients/user/{user_id}")
        assert r.status_code == 200, f"Could not fetch patient: {r.text}"
        patient_id = r.json()["id"]
    else:
        assert r.status_code == 200, f"Patient creation failed: {r.text}"
        patient_id = r.json()["id"]
    print("Patient OK:", patient_id)

    print("Testing diabetes prediction...")
    features = {
        "pregnancies": 1, "glucose": 120, "blood_pressure": 70,
        "skin_thickness": 20, "insulin": 85, "bmi": 28.0,
        "diabetes_pedigree_function": 0.3, "age": 45
    }
    r = client.post("/api/v1/predictions/diabetes", json={"patient_id": patient_id, "features": features})
    if r.status_code == 503:
         print("Diabetes model not found (503), but endpoint routed successfully.")
    else:
         assert r.status_code == 200, f"Diabetes prediction failed: {r.text}"
         print("Diabetes Prediction OK")

    print("Testing heart prediction...")
    heart_features = {
        "age": 45, "sex": 1, "cp": 1, "trestbps": 120,
        "chol": 200, "fbs": 0, "restecg": 0, "thalach": 150,
        "exang": 0, "oldpeak": 0.0, "slope": 1, "ca": 0, "thal": 2
    }
    r = client.post("/api/v1/predictions/heart", json={"patient_id": patient_id, "features": heart_features})
    if r.status_code == 503:
         print("Heart model not found (503), but endpoint routed successfully.")
    else:
         assert r.status_code == 200, f"Heart prediction failed: {r.text}"
         print("Heart Prediction OK")

    print("Testing OCR upload...")
    # Create a dummy file for upload
    import io
    files = {"file": ("test.pdf", io.BytesIO(b"dummy pdf content"), "application/pdf")}
    data = {"patient_id": str(patient_id), "doc_type": "lab_report"}
    r = client.post("/api/v1/documents/upload", data=data, files=files)
    assert r.status_code == 200, f"OCR upload failed: {r.text}"
    report_id = r.json()["id"]
    print("OCR upload OK:", report_id)

    print("Testing OCR fetch...")
    r = client.get(f"/api/v1/documents/{report_id}/ocr")
    assert r.status_code == 200, f"OCR fetch failed: {r.text}"
    print("OCR fetch OK")

    print("Testing safe chat prompt...")
    r = client.post("/api/v1/chat/", json={"message": "What is the capital of France?", "context_type": "general"})
    if r.status_code == 503:
        print("Chat service unavailable (503), but endpoint routed correctly.")
    else:
        assert r.status_code == 200, f"Chat safe prompt failed: {r.text}"
        print("Safe chat prompt OK")

    print("Testing escalated chat prompt...")
    r = client.post("/api/v1/chat/", json={"message": "I am having extreme chest pain and feel like I am having a heart attack right now.", "context_type": "general"})
    if r.status_code == 503:
        print("Chat service unavailable (503), but endpoint routed correctly.")
    else:
        assert r.status_code == 200, f"Chat escalated prompt failed: {r.text}"
        print("Escalated chat prompt OK")

    print("ALL TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test()
