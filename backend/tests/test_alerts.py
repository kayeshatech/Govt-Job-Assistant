import pytest
from fastapi.testclient import TestClient
from app.models.alert import StudentAlert
from app.models.student import StudentProfile

def test_student_alerts_isolation_and_lifecycle(
    client: TestClient,
    student_a_token: str,
    student_b_token: str,
    db_session,
):
    """
    Verify personalized alerts isolation and full lifecycle:
    1. Seed an alert for Student A.
    2. Student A sees their alert; Student B does NOT see Student A's alert.
    3. Student A marks alert as read.
    4. Student A dismisses alert.
    5. Student B receives 404/cannot dismiss Student A's alert.
    """
    headers_a = {"Authorization": f"Bearer {student_a_token}"}
    headers_b = {"Authorization": f"Bearer {student_b_token}"}

    # Seed alert for Student A (sub: "student-uuid-aaa-111")
    alert_a = StudentAlert(
        student_id="student-uuid-aaa-111",
        alert_type="CLOSING_SOON",
        title="UPSC CSE 2026: Closing in 3 Days",
        message="Last date to submit your online application is 2026-03-05.",
        reference_id="upsc-cse-2026",
        priority="HIGH",
        is_read=False,
        is_dismissed=False,
    )
    db_session.add(alert_a)
    db_session.commit()
    db_session.refresh(alert_a)

    # 1. Student A queries alerts -> sees 1 alert
    res_a = client.get("/api/v1/alerts", headers=headers_a)
    assert res_a.status_code == 200
    alerts_a = res_a.json()["data"]
    assert len(alerts_a) >= 1
    alert_ids_a = [a["id"] for a in alerts_a]
    assert alert_a.id in alert_ids_a

    # 2. Student B queries alerts -> does NOT see Student A's alert (Strict Isolation)
    res_b = client.get("/api/v1/alerts", headers=headers_b)
    assert res_b.status_code == 200
    alerts_b = res_b.json()["data"]
    alert_ids_b = [a["id"] for a in alerts_b]
    assert alert_a.id not in alert_ids_b

    # 3. Student B attempts to dismiss Student A's alert -> 404 Not Found (Row Isolation)
    res_tamper = client.delete(f"/api/v1/alerts/{alert_a.id}", headers=headers_b)
    assert res_tamper.status_code == 404

    # 4. Student A marks alert as read
    res_read = client.put(
        "/api/v1/alerts/read",
        json={"alert_ids": [alert_a.id], "mark_all": False},
        headers=headers_a,
    )
    assert res_read.status_code == 200
    assert res_read.json()["data"] is True

    db_session.refresh(alert_a)
    assert alert_a.is_read is True

    # 5. Student A dismisses alert
    res_dismiss = client.delete(f"/api/v1/alerts/{alert_a.id}", headers=headers_a)
    assert res_dismiss.status_code == 200

    # Verify dismissed alert no longer appears in active list
    res_after = client.get("/api/v1/alerts", headers=headers_a)
    active_ids = [a["id"] for a in res_after.json()["data"]]
    assert alert_a.id not in active_ids

def test_alert_preferences_get_and_update(client: TestClient, student_a_token: str):
    """Verify students can retrieve and customize their alert channel preferences."""
    headers = {"Authorization": f"Bearer {student_a_token}"}

    # Fetch initial preferences
    res_get = client.get("/api/v1/alerts/preferences", headers=headers)
    assert res_get.status_code == 200
    data = res_get.json()["data"]
    assert "alert_new_exams" in data
    assert "email_notification_opt_in" in data

    # Update preferences: Disable deadline reminders and disable email opt-in
    update_payload = {
        "alert_deadline_reminders": False,
        "email_notification_opt_in": False,
    }
    res_update = client.put("/api/v1/alerts/preferences", json=update_payload, headers=headers)
    assert res_update.status_code == 200
    updated_data = res_update.json()["data"]
    assert updated_data["alert_deadline_reminders"] is False
    assert updated_data["email_notification_opt_in"] is False
    # Others remain True
    assert updated_data["alert_new_exams"] is True
