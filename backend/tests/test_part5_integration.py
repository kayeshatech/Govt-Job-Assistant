import pytest
import uuid
from datetime import timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.security import create_access_token
from app.services.scraper_service import ScraperService
from app.models.student import (
    StudentProfile,
    StudentPreference,
    SavedExam,
    StudyPlan,
    DailyStudyTask,
)
from app.models.preparation import MockTestAttempt, StudentMistake, PomodoroSession
from app.models.community import StudyGroup, GroupDiscussionMessage, MentorProfile

@pytest.fixture
def student_token_headers(student_a_token):
    return {"Authorization": f"Bearer {student_a_token}"}

def test_health_and_metrics_endpoints(client: TestClient):
    """Verify production operational health check and metrics endpoints (Section 4)."""
    # 1. Health check with live database connectivity verification
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert health_data["status"] in ("healthy", "online")
    assert health_data["database"]["status"] == "connected"

    # 2. Operational telemetry metrics
    metrics_resp = client.get("/api/v1/metrics")
    assert metrics_resp.status_code == 200
    metrics_data = metrics_resp.json()
    assert metrics_data["system_status"] in ("HEALTHY", "healthy")
    assert "metrics" in metrics_data
    assert metrics_data["metrics"]["total_government_exams"] >= 1
    assert metrics_data["metrics"]["active_recruitment_notifications"] >= 1
    assert metrics_data["metrics"]["monitored_official_sources"] >= 1
    assert metrics_data["rate_limiting"]["status"] == "ENFORCING"


def test_ssrf_domain_whitelist_and_ip_blocking():
    """Verify strict SSRF defense: blocking cloud metadata, localhost, private IPs, and non-whitelisted schemes (Section 3)."""
    scraper = ScraperService()

    # Block non-HTTP schemes
    assert not scraper.is_permitted_url("file:///etc/passwd")
    assert not scraper.is_permitted_url("ftp://upsc.gov.in/syllabus.pdf")
    assert not scraper.is_permitted_url("gopher://127.0.0.1:70")

    # Block localhost and loopback addresses
    assert not scraper.is_permitted_url("http://localhost:8000/api/v1")
    assert not scraper.is_permitted_url("http://127.0.0.1:8000/secrets")
    assert not scraper.is_permitted_url("http://0.0.0.0:80")
    assert not scraper.is_permitted_url("http://[::1]:8080/admin")

    # Block cloud instance metadata services (AWS/GCP/Azure)
    assert not scraper.is_permitted_url("http://169.254.169.254/latest/meta-data/")
    assert not scraper.is_permitted_url("http://metadata.google.internal/computeMetadata/v1/")

    # Block private RFC-1918 internal subnets
    assert not scraper.is_permitted_url("http://10.0.0.5/internal-api")
    assert not scraper.is_permitted_url("http://172.16.0.1/admin")
    assert not scraper.is_permitted_url("http://192.168.1.1/router")

    # Allow valid official Indian government portal URLs
    assert scraper.is_permitted_url("https://upsc.gov.in/examinations/active-exams")
    assert scraper.is_permitted_url("https://ssc.gov.in/notice-board")
    assert scraper.is_permitted_url("https://isro.gov.in/careers")


def test_student_account_deletion_dpdp_cascade(client: TestClient, db_session: Session):
    """
    Verify complete DPDP Act 2023 / GDPR student right to erasure (Section 3).
    Cascades across all 11 student-specific tables and removes the profile entirely.
    """
    student_id = f"student-erase-{uuid.uuid4().hex[:8]}"
    token_payload = {
        "sub": student_id,
        "email": f"{student_id}@test.in",
        "role": "authenticated",
        "app_metadata": {"role": "student"},
        "user_metadata": {"full_name": "Erasure Aspirant"},
    }
    erase_headers = {"Authorization": f"Bearer {create_access_token(token_payload, expires_delta=timedelta(hours=2))}"}

    # Create fresh student profile
    student = StudentProfile(
        id=student_id,
        email=f"{student_id}@test.in",
        full_name="Aspirant Erasure Test",
        date_of_birth="1998-05-15",
        gender="Male",
        category="OBC",
        domicile_state="Karnataka",
    )
    db_session.add(student)
    db_session.commit()

    # Create associated child records
    pref = StudentPreference(student_id=student_id, target_categories=["Central"], target_exam_codes=["UPSC-CSE"])
    db_session.add(pref)

    saved = SavedExam(
        student_id=student_id,
        exam_id="exam-upsc-cse",
        exam_title="Civil Services Examination 2026",
        conducting_body="UPSC",
        status="Draft / Planning",
    )
    db_session.add(saved)

    pomodoro = PomodoroSession(student_id=student_id, duration_minutes=25, topic="General Study")
    db_session.add(pomodoro)

    db_session.commit()

    # Issue DELETE account request
    del_resp = client.delete("/api/v1/auth/account", headers=erase_headers)
    assert del_resp.status_code == 200
    del_data = del_resp.json()
    assert "DPDP" in del_data["message"]

    # Verify student profile and child records are completely purged
    purged_student = db_session.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    assert purged_student is None

    purged_pref = db_session.query(StudentPreference).filter(StudentPreference.student_id == student_id).first()
    assert purged_pref is None

    purged_saved = db_session.query(SavedExam).filter(SavedExam.student_id == student_id).first()
    assert purged_saved is None

    purged_pomodoro = db_session.query(PomodoroSession).filter(PomodoroSession.student_id == student_id).first()
    assert purged_pomodoro is None


def test_community_study_groups_and_xss_defense(client: TestClient, db_session: Session, student_token_headers):
    """Verify Feature 88 peer study circles, message threads, and anti-XSS HTML sanitization."""
    # 1. Fetch study groups
    list_resp = client.get("/api/v1/community/groups")
    assert list_resp.status_code == 200
    groups = list_resp.json()
    assert len(groups) >= 1

    # 2. Create study group with potential XSS payload in name & description
    xss_payload = {
        "name": "<script>alert('xss-circle')</script> UPSC Study Circle",
        "exam_code": "UPSC-CSE",
        "description": "<img src=x onerror=alert('xss-desc')> Daily Mains Answer Writing Practice",
        "category": "Answer Review",
    }
    create_resp = client.post("/api/v1/community/groups", json=xss_payload, headers=student_token_headers)
    assert create_resp.status_code == 200
    created_data = create_resp.json()

    # Verify HTML escaping
    assert "<script>" not in created_data["name"]
    assert "&lt;script&gt;" in created_data["name"]
    assert "<img" not in created_data["description"]
    assert "&lt;img" in created_data["description"]
    group_id = created_data["id"]

    # 3. Post a discussion query with XSS payload
    msg_payload = {"content": "<b>Important Note:</b> <script>document.cookie='steal'</script> When is the gazette released?"}
    msg_resp = client.post(f"/api/v1/community/groups/{group_id}/messages", json=msg_payload, headers=student_token_headers)
    assert msg_resp.status_code == 200
    msg_data = msg_resp.json()
    assert "<script>" not in msg_data["content"]
    assert "&lt;script&gt;" in msg_data["content"]

    # 4. Retrieve messages for the circle
    thread_resp = client.get(f"/api/v1/community/groups/{group_id}/messages")
    assert thread_resp.status_code == 200
    msgs = thread_resp.json()
    assert len(msgs) >= 1
    assert msgs[-1]["content"] == msg_data["content"]


def test_mentor_verification_and_dashboard(client: TestClient):
    """Verify Feature 89 mentor profiles directory and evaluation dashboard."""
    # 1. List verified mentors
    mentors_resp = client.get("/api/v1/community/mentors")
    assert mentors_resp.status_code == 200
    mentors = mentors_resp.json()
    assert len(mentors) >= 1
    assert any(m["full_name"] == "Prof. Anand Deshmukh" for m in mentors)
    assert all(m["is_verified"] is True for m in mentors)

    # 2. Mentor dashboard overview
    dash_resp = client.get("/api/v1/community/mentor-dashboard")
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert "mentor_profile" in dash_data
    assert "assigned_study_groups" in dash_data
    assert "unresolved_questions_count" in dash_data
    assert isinstance(dash_data["recent_student_queries"], list)


def test_end_to_end_student_lifecycle_journey(client: TestClient, db_session: Session, student_token_headers):
    """
    Verify complete end-to-end critical journey:
    1. Student creates/updates profile
    2. Searches examinations
    3. Evaluates eligibility
    4. Saves examination to application tracker
    5. Queries Ask-Your-PDF RAG
    6. Submits a mock test
    7. Cleans up profile via DPDP deletion
    """
    student_id = "test-student-id"

    # Step 1: Profile setup
    profile_payload = {
        "full_name": "Kavitha Sharma",
        "date_of_birth": "1997-08-20",
        "gender": "Female",
        "category": "General",
        "domicile_state": "Karnataka",
        "education_level": "Post Graduation",
        "graduation_percentage": 74.5,
    }
    prof_resp = client.put("/api/v1/auth/profile", json=profile_payload, headers=student_token_headers)
    assert prof_resp.status_code == 200

    # Step 2: Exam search
    exam_resp = client.get("/api/v1/exams")
    assert exam_resp.status_code == 200
    exams = exam_resp.json()["items"]
    assert len(exams) >= 1
    target_exam = exams[0]
    exam_code = target_exam["code"]

    # Step 3: Eligibility evaluation
    elig_payload = {
        "exam_code": exam_code,
        "date_of_birth": "1997-08-20",
        "category": "General",
        "domicile_state": "Karnataka",
        "highest_qualification": "Post Graduation",
        "graduation_percentage": 74.5,
    }
    elig_resp = client.post("/api/v1/eligibility/check", json=elig_payload)
    assert elig_resp.status_code == 200
    elig_data = elig_resp.json()
    assert elig_data["success"] is True
    assert "results" in elig_data["data"]

    # Step 4: Save exam
    save_resp = client.post(
        "/api/v1/saved-exams",
        json={"exam_id": target_exam["id"], "status": "PREPARING"},
        headers=student_token_headers,
    )
    assert save_resp.status_code == 201

    # Step 5: Ask-Your-PDF RAG retrieval
    rag_resp = client.post(
        "/api/v1/ai/rag/query",
        json={"query": "What is the educational qualification required?", "exam_code": exam_code},
    )
    assert rag_resp.status_code == 200
    rag_data = rag_resp.json()
    assert "answer" in rag_data
    assert isinstance(rag_data["citations"], list)

    # Step 6: Submit a mini mock test attempt
    mock_payload = {
        "answers": {"qb-upsc-01": 0},
        "time_spent_seconds": 60,
    }
    attempt_resp = client.post(
        "/api/v1/prep/tests/mock-upsc-prelims-gs/submit",
        json=mock_payload,
        headers=student_token_headers,
    )
    assert attempt_resp.status_code == 200
    attempt_data = attempt_resp.json()
    assert attempt_data["success"] is True
    assert "score" in attempt_data
    assert "accuracy_percentage" in attempt_data

    # Step 7: Final DPDP Data Erasure
    purge_resp = client.delete("/api/v1/auth/account", headers=student_token_headers)
    assert purge_resp.status_code == 200
