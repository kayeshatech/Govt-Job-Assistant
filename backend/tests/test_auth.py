def test_missing_auth_token_raises_401(client):
    """Endpoints requiring authentication must reject unauthenticated requests."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "token required" in response.json()["detail"].lower()

def test_invalid_jwt_signature_raises_401(client):
    """Tampered or invalid tokens must be rejected."""
    headers = {"Authorization": "Bearer invalid.jwt.signature"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401

def test_authenticated_student_session(client, student_a_token):
    """Verified student token allows access to own session and profile."""
    headers = {"Authorization": f"Bearer {student_a_token}"}
    response = client.get("/api/v1/auth/session", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["user_id"] == "student-uuid-aaa-111"
    assert data["email"] == "student.a@test.in"
    assert data["is_admin"] is False

def test_update_student_profile(client, student_a_token):
    """Students can update their domicile, category, and study hours."""
    headers = {"Authorization": f"Bearer {student_a_token}"}
    update_payload = {
        "full_name": "Priya S. Sharma",
        "category": "OBC-NCL",
        "domicile_state": "Karnataka",
        "preferred_daily_study_hours": 8,
        "target_categories": ["Civil Services & Administration", "Engineering & PSU"],
    }
    response = client.put("/api/v1/auth/profile", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["full_name"] == "Priya S. Sharma"
    assert data["category"] == "OBC-NCL"
    assert data["preferred_daily_study_hours"] == 8
    assert "Civil Services & Administration" in data["target_categories"]

def test_admin_role_authorization(client, admin_token, student_a_token):
    """Admin endpoints must allow verified admin and deny regular students."""
    # Student attempts admin audit log access -> 403 Forbidden
    student_headers = {"Authorization": f"Bearer {student_a_token}"}
    student_resp = client.get("/api/v1/admin/audit-logs", headers=student_headers)
    assert student_resp.status_code == 403
    assert "privileges required" in student_resp.json()["detail"].lower()

    # Admin access -> 200 OK
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_resp = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert admin_resp.status_code == 200
    assert "data" in admin_resp.json()
