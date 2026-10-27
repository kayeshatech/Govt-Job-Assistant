from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.student import StudentProfile
from app.models.preparation import QuestionBank, MockTest, StudentMistake
from app.schemas.prep import TestSubmissionRequest, PomodoroLogRequest
from app.services.performance_engine import PerformanceEngine
from app.services.kset_ugc_service import KsetUgcService
from app.services.productivity_service import ProductivityService

router = APIRouter()

# 1. Questions API
@router.get("/questions")
def list_questions(
    exam_code: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve practice and PYQ questions from verified question bank."""
    q = db.query(QuestionBank).filter(QuestionBank.is_active == True)
    if exam_code and exam_code != "all":
        q = q.filter(QuestionBank.exam_code == exam_code)
    if subject and subject != "all":
        q = q.filter(QuestionBank.subject == subject)
    if topic and topic != "all":
        q = q.filter(QuestionBank.topic.ilike(f"%{topic}%"))
    if difficulty and difficulty != "all":
        q = q.filter(QuestionBank.difficulty == difficulty.upper())

    items = q.limit(limit).all()
    return {
        "success": True,
        "total": len(items),
        "questions": [
            {
                "id": item.id,
                "exam_code": item.exam_code,
                "paper_type": item.paper_type,
                "subject": item.subject,
                "topic": item.topic,
                "question_text": item.question_text,
                "options": item.options,
                "correct_option_index": item.correct_option_index,
                "explanation": item.explanation,
                "difficulty": item.difficulty,
                "question_source": item.question_source,
                "pyq_year": item.pyq_year,
                "source_citation": item.source_citation,
            }
            for item in items
        ],
    }


# 2. Mock Tests API
@router.get("/tests")
def list_mock_tests(
    exam_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List available standardized and practice mock tests."""
    q = db.query(MockTest).filter(MockTest.is_published == True)
    if exam_code and exam_code != "all":
        q = q.filter(MockTest.exam_code == exam_code)
    tests = q.all()
    return {
        "success": True,
        "total": len(tests),
        "tests": [
            {
                "id": t.id,
                "title": t.title,
                "exam_code": t.exam_code,
                "test_type": t.test_type,
                "total_questions": t.total_questions,
                "duration_minutes": t.duration_minutes,
                "positive_marks": t.positive_marks_per_q,
                "negative_marks": t.negative_marks_per_q,
                "instructions": t.instructions,
            }
            for t in tests
        ],
    }


@router.get("/tests/{test_id}")
def get_mock_test_details(
    test_id: str,
    db: Session = Depends(get_db),
):
    """Fetch mock test details along with its questions (options included, answers omitted for testing)."""
    test = db.query(MockTest).filter(MockTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Mock test not found")

    questions = db.query(QuestionBank).filter(QuestionBank.id.in_(test.question_ids)).all()
    return {
        "success": True,
        "test": {
            "id": test.id,
            "title": test.title,
            "exam_code": test.exam_code,
            "duration_minutes": test.duration_minutes,
            "positive_marks": test.positive_marks_per_q,
            "negative_marks": test.negative_marks_per_q,
            "total_questions": len(questions),
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "options": q.options,
                    "subject": q.subject,
                    "topic": q.topic,
                    "difficulty": q.difficulty,
                }
                for q in questions
            ],
        },
    }


@router.post("/tests/{test_id}/submit")
def submit_mock_test(
    test_id: str,
    req: TestSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: StudentProfile = Depends(get_current_user),
):
    """
    Score a test submission deterministically against verified answer keys.
    Updates mistake notebook and logs attempt metrics.
    """
    engine = PerformanceEngine(db)
    attempt = engine.evaluate_test_attempt(
        student_id=current_user.id,
        mock_test_id=test_id,
        answers=req.answers,
        time_spent_seconds=req.time_spent_seconds,
    )
    return {
        "success": True,
        "attempt_id": attempt.id,
        "score": attempt.score,
        "total_marks": attempt.total_marks,
        "accuracy_percentage": attempt.accuracy_percentage,
        "total_attempted": attempt.total_attempted,
        "correct_count": attempt.correct_count,
        "incorrect_count": attempt.incorrect_count,
        "weak_topics": attempt.weak_topics,
        "strong_topics": attempt.strong_topics,
        "percentile_rank": attempt.percentile_rank,
    }


# 3. Performance & Mistake Notebook API
@router.get("/performance")
def get_performance_diagnostics(
    db: Session = Depends(get_db),
    current_user: StudentProfile = Depends(get_current_user),
):
    """Aggregate measurable performance metrics derived from recorded attempts."""
    engine = PerformanceEngine(db)
    summary = engine.get_student_performance_summary(current_user.id)
    return {"success": True, "performance": summary}


@router.get("/mistakes")
def get_mistake_notebook(
    resolved: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: StudentProfile = Depends(get_current_user),
):
    """Retrieve items from the student's personal mistake notebook."""
    mistakes = db.query(StudentMistake).filter(
        StudentMistake.student_id == current_user.id,
        StudentMistake.is_resolved == resolved,
    ).all()
    return {
        "success": True,
        "total": len(mistakes),
        "mistakes": [
            {
                "id": m.id,
                "question_id": m.question_id,
                "topic": m.topic,
                "subject": m.subject,
                "chosen_option_index": m.chosen_option_index,
                "correct_option_index": m.correct_option_index,
                "review_count": m.review_count,
                "is_resolved": m.is_resolved,
                "question_text": m.question.question_text if m.question else "",
                "options": m.question.options if m.question else [],
                "explanation": m.question.explanation if m.question else "",
            }
            for m in mistakes
        ],
    }


@router.post("/mistakes/test")
def generate_mistake_recovery_test(
    db: Session = Depends(get_db),
    current_user: StudentProfile = Depends(get_current_user),
):
    """Generate a custom practice test composed exclusively of questions previously missed."""
    engine = PerformanceEngine(db)
    test = engine.create_mistake_based_test(current_user.id)
    if not test:
        return {"success": False, "message": "No unresolved mistakes found in notebook."}
    return {"success": True, "test_id": test.id, "title": test.title, "total_questions": test.total_questions}


# 4. KSET & UGC-NET Specialized Endpoints
@router.get("/kset-ugc/curriculum")
def get_kset_ugc_curriculum(db: Session = Depends(get_db)):
    """Fetch versioned Paper 1 and Paper 2 syllabus units and exam distinctions."""
    svc = KsetUgcService(db)
    return {"success": True, "curriculum": svc.get_curriculum_overview()}


@router.get("/kset-ugc/pyqs")
def get_kset_ugc_pyqs(
    unit: Optional[int] = Query(None, ge=1, le=10),
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
):
    """Fetch verified Paper 1 / Paper 2 PYQs filtered by unit."""
    svc = KsetUgcService(db)
    items = svc.get_pyq_practice_set(unit_number=unit, limit=limit)
    return {"success": True, "total": len(items), "questions": items}


# 5. Productivity & Adaptive Study Plans API
@router.get("/productivity")
def get_productivity_stats(
    db: Session = Depends(get_db),
    current_user: StudentProfile = Depends(get_current_user),
):
    """Fetch today's study goals, streaks, and focus metrics."""
    svc = ProductivityService(db)
    stats = svc.get_productivity_status(current_user.id)
    return {"success": True, "productivity": stats}


@router.post("/productivity/pomodoro")
def log_pomodoro(
    req: PomodoroLogRequest,
    db: Session = Depends(get_db),
    current_user: StudentProfile = Depends(get_current_user),
):
    """Record completed focus session and update study streak."""
    svc = ProductivityService(db)
    session = svc.log_pomodoro_session(current_user.id, req.duration_minutes, req.topic)
    return {"success": True, "session_id": session.id, "duration": session.duration_minutes}


@router.get("/productivity/plans")
def get_adaptive_study_plan(
    plan_type: str = Query("last_30_days"),
    hours: float = Query(6.0),
    exam: str = Query("UPSC CSE 2026"),
    db: Session = Depends(get_db),
):
    """Generate adaptive 30-day, 7-day, or emergency crash preparation blueprint."""
    svc = ProductivityService(db)
    plan = svc.generate_adaptive_plan(plan_type, hours, exam)
    return {"success": True, "plan": plan}
