from app.main import app

def test_register_login_and_protected_me(client):
    from app.api.deps import get_current_user
    original_override = app.dependency_overrides.pop(get_current_user, None)
    
    register_response = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "StrongPass123", "role": "patient"},
    )
    assert register_response.status_code == 200
    access_token = register_response.json()["access_token"]
    assert access_token

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    login_token = login_response.json()["access_token"]
    assert login_token

    me_response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {login_token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "user@example.com"
    
    if original_override:
        app.dependency_overrides[get_current_user] = original_override


def test_protected_route_requires_jwt(client):
    from app.api.deps import get_current_user
    original_override = app.dependency_overrides.pop(get_current_user, None)
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    if original_override:
        app.dependency_overrides[get_current_user] = original_override


def test_admin_denies_non_admin_even_with_spoofed_header(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "patient@example.com", "password": "StrongPass123", "role": "patient"},
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "patient@example.com", "password": "StrongPass123"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/admin/overview",
        headers={"Authorization": f"Bearer {token}", "x-role": "admin"},
    )
    assert response.status_code == 403


def test_invalid_role_rejected_on_register(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "badrole@example.com", "password": "StrongPass123", "role": "superuser"},
    )
    assert response.status_code == 422


def test_refresh_flow(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "refresh@example.com", "password": "StrongPass123", "role": "patient"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "refresh@example.com", "password": "StrongPass123"},
    )
    token = login.json()["access_token"]

    refresh = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {token}"})
    assert refresh.status_code == 200
    assert refresh.json()["access_token"]


def test_logout_behavior(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "logout@example.com", "password": "StrongPass123", "role": "patient"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "logout@example.com", "password": "StrongPass123"},
    )
    token = login.json()["access_token"]

    logout = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout.status_code == 204


def test_forgot_password_response_behavior(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "known@example.com", "password": "StrongPass123", "role": "patient"},
    )
    known = client.post("/api/v1/auth/forgot-password", json={"email": "known@example.com"})
    unknown = client.post("/api/v1/auth/forgot-password", json={"email": "unknown@example.com"})

    assert known.status_code == 200
    assert unknown.status_code == 200
    assert known.json()["message"] == unknown.json()["message"]
