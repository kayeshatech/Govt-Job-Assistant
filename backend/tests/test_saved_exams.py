import pytest
from fastapi.testclient import TestClient

def test_unauthenticated_saved_exams_denied(client: TestClient):
    """Verify that unauthenticated requests to saved exams receive 401."""
    res = client.get("/api/v1/saved-exams")
    assert res.status_code == 401

def test_student_isolation_and_crud(
    client: TestClient,
    student_a_token: str,
    student_b_token: str,
):
    """
    Test complete application tracking lifecycle and verify strict student isolation:
    1. Student A saves an exam.
    2. Student B cannot see Student A's saved exam.
    3. Student B cannot update or delete Student A's saved exam (403 Forbidden).
    4. Student A can update and delete their own saved exam.
    """
    headers_a = {"Authorization": f"Bearer {student_a_token}"}
    headers_b = {"Authorization": f"Bearer {student_b_token}"}

    # Step 1: Student A lists saved exams initially (should be empty)
    res = client.get("/api/v1/saved-exams", headers=headers_a)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) == 0

    # Step 2: Student A saves UPSC CSE
    save_payload = {
        "exam_id": "upsc-cse",
        "status": "Target / Preparing",
        "notes": "Targeting Prelims 2026 with GS foundation",
    }
    res_save = client.post("/api/v1/saved-exams", json=save_payload, headers=headers_a)
    assert res_save.status_code == 201
    save_data = res_save.json()["data"]
    saved_record_id = save_data["id"]
    assert save_data["student_id"] == "student-uuid-aaa-111"
    assert "Civil Services" in save_data["exam_title"]

    # Step 3: Student B retrieves saved exams -> MUST be empty (Student B cannot see Student A's exam)
    res_b = client.get("/api/v1/saved-exams", headers=headers_b)
    assert res_b.status_code == 200
    assert len(res_b.json()["data"]) == 0

    # Step 4: Student B attempts to update Student A's saved exam -> MUST be 403 Forbidden
    res_tamper = client.put(
        f"/api/v1/saved-exams/{saved_record_id}",
        json={"status": "Admit Card Downloaded", "roll_number": "HAX-9999"},
        headers=headers_b,
    )
    assert res_tamper.status_code == 403
    assert "Forbidden" in res_tamper.json()["detail"]

    # Step 5: Student B attempts to delete Student A's saved exam -> MUST be 403 Forbidden
    res_delete_tamper = client.delete(
        f"/api/v1/saved-exams/{saved_record_id}",
        headers=headers_b,
    )
    assert res_delete_tamper.status_code == 403
    assert "Forbidden" in res_delete_tamper.json()["detail"]

    # Step 6: Student A updates their own saved exam -> Slashes to Application Submitted
    res_update = client.put(
        f"/api/v1/saved-exams/{saved_record_id}",
        json={"status": "Application Submitted", "roll_number": "UPSC-2026-081921"},
        headers=headers_a,
    )
    assert res_update.status_code == 200
    updated_data = res_update.json()["data"]
    assert updated_data["status"] == "Application Submitted"
    assert updated_data["roll_number"] == "UPSC-2026-081921"

    # Step 7: Student A deletes their saved exam
    res_del = client.delete(f"/api/v1/saved-exams/{saved_record_id}", headers=headers_a)
    assert res_del.status_code == 200
    assert res_del.json()["data"] is True

    # Step 8: Verify Student A has 0 saved exams again
    res_after = client.get("/api/v1/saved-exams", headers=headers_a)
    assert res_after.status_code == 200
    assert len(res_after.json()["data"]) == 0

def test_save_nonexistent_exam_returns_404(client: TestClient, student_a_token: str):
    """Attempting to save an invalid exam slug returns 404."""
    headers = {"Authorization": f"Bearer {student_a_token}"}
    res = client.post(
        "/api/v1/saved-exams",
        json={"exam_id": "non-existent-exam-slug-xyz"},
        headers=headers,
    )
    assert res.status_code == 404
