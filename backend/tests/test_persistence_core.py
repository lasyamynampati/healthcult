def _auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_create_patient_risk_chat_document_persistence(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": "core@example.com", "password": "StrongPass123", "role": "patient"},
    )
    token = reg.json()["access_token"]

    me = client.get("/api/v1/users/me", headers=_auth_header(token)).json()

    patient_resp = client.post(
        "/api/v1/patients",
        json={"user_id": me["id"], "external_ref": "EXT-001"},
        headers=_auth_header(token),
    )
    assert patient_resp.status_code == 200
    patient = patient_resp.json()

    ra_resp = client.post(
        "/api/v1/predictions/diabetes",
        json={
            "patient_id": patient["id"],
            "features": {
                "pregnancies": 1,
                "glucose": 120,
                "blood_pressure": 70,
                "skin_thickness": 20,
                "insulin": 85,
                "bmi": 28.0,
                "diabetes_pedigree_function": 0.3,
                "age": 45,
            },
        },
        headers=_auth_header(token),
    )
    assert ra_resp.status_code in (200, 503)

    chat_session_resp = client.post(
        "/api/v1/chat/",
        json={"message": "Hello", "context_type": "general"},
        headers=_auth_header(token),
    )
    assert chat_session_resp.status_code == 200
    assert "reply" in chat_session_resp.json()

    doc_resp = client.post(
        "/api/v1/reports",
        json={"patient_id": patient["id"], "storage_uri": "s3://bucket/key.pdf", "doc_type": "lab_report"},
        headers=_auth_header(token),
    )
    assert doc_resp.status_code == 200
    assert doc_resp.json()["status"] == "uploaded"

