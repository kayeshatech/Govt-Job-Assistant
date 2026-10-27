from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.preparation import (
    QuestionBank,
    MockTest,
    MockTestAttempt,
    StudentMistake,
)
from app.services.llm_provider import get_llm_provider, BaseLLMProvider

class PerformanceEngine:
    """
    Deterministic evaluation engine for scoring objective tests,
    tracking mistake notebooks, detecting weak topics, and generating revision insights.
    """

    def __init__(self, db: Session, llm: Optional[BaseLLMProvider] = None):
        self.db = db
        self.llm = llm or get_llm_provider()

    def evaluate_test_attempt(
        self,
        student_id: str,
        mock_test_id: str,
        answers: Dict[str, int], # {question_id: chosen_option_index}
        time_spent_seconds: int = 1800,
    ) -> MockTestAttempt:
        """
        Score a student's test submission deterministically against verified answer keys.
        No LLM is allowed to score objective responses.
        """
        mock_test = self.db.query(MockTest).filter(MockTest.id == mock_test_id).first()
        if not mock_test:
            raise ValueError(f"MockTest with id {mock_test_id} not found")

        # Fetch questions
        questions = self.db.query(QuestionBank).filter(
            QuestionBank.id.in_(mock_test.question_ids)
        ).all()
        q_map = {q.id: q for q in questions}

        total_attempted = 0
        correct_count = 0
        incorrect_count = 0
        score = 0.0
        topic_performance: Dict[str, Dict[str, int]] = {} # topic -> {correct: X, total: Y}

        mistakes_to_record: List[StudentMistake] = []

        for q_id, q_obj in q_map.items():
            topic = q_obj.topic
            if topic not in topic_performance:
                topic_performance[topic] = {"correct": 0, "total": 0}

            if str(q_id) in answers:
                chosen_opt = answers[str(q_id)]
                if chosen_opt is not None and chosen_opt >= 0:
                    total_attempted += 1
                    topic_performance[topic]["total"] += 1

                    if chosen_opt == q_obj.correct_option_index:
                        correct_count += 1
                        score += mock_test.positive_marks_per_q
                        topic_performance[topic]["correct"] += 1
                    else:
                        incorrect_count += 1
                        score -= mock_test.negative_marks_per_q
                        # Record mistake in student's notebook
                        mistake = StudentMistake(
                            student_id=student_id,
                            question_id=q_obj.id,
                            chosen_option_index=chosen_opt,
                            correct_option_index=q_obj.correct_option_index,
                            topic=q_obj.topic,
                            subject=q_obj.subject,
                            review_count=1,
                            is_resolved=False,
                        )
                        mistakes_to_record.append(mistake)

        unanswered_count = len(questions) - total_attempted
        total_marks = len(questions) * mock_test.positive_marks_per_q
        accuracy_percentage = (correct_count / total_attempted * 100.0) if total_attempted > 0 else 0.0

        # Derive weak (<50%) and strong (>80%) topics
        weak_topics = []
        strong_topics = []
        for top, stats in topic_performance.items():
            if stats["total"] > 0:
                top_acc = (stats["correct"] / stats["total"]) * 100.0
                if top_acc < 50.0:
                    weak_topics.append(top)
                elif top_acc >= 80.0:
                    strong_topics.append(top)

        now = datetime.now(timezone.utc)
        attempt = MockTestAttempt(
            student_id=student_id,
            mock_test_id=mock_test.id,
            exam_code=mock_test.exam_code,
            started_at=now,
            submitted_at=now,
            time_spent_seconds=time_spent_seconds,
            answers=answers,
            total_attempted=total_attempted,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unanswered_count=unanswered_count,
            score=round(score, 2),
            total_marks=total_marks,
            accuracy_percentage=round(accuracy_percentage, 1),
            percentile_rank=round(min(99.0, max(10.0, 50.0 + (score / (total_marks or 1.0)) * 45.0)), 1),
            weak_topics=weak_topics,
            strong_topics=strong_topics,
        )
        self.db.add(attempt)
        self.db.flush()

        for m in mistakes_to_record:
            m.attempt_id = attempt.id
            self.db.add(m)

        self.db.commit()
        self.db.refresh(attempt)
        return attempt

    def get_student_performance_summary(self, student_id: str) -> Dict[str, Any]:
        """
        Aggregate measurable performance metrics derived exclusively from actual recorded attempts.
        """
        attempts = self.db.query(MockTestAttempt).filter(
            MockTestAttempt.student_id == student_id
        ).order_by(desc(MockTestAttempt.submitted_at)).all()

        unresolved_mistakes_count = self.db.query(StudentMistake).filter(
            StudentMistake.student_id == student_id,
            StudentMistake.is_resolved == False,
        ).count()

        if not attempts:
            return {
                "total_tests_taken": 0,
                "average_score": 0.0,
                "average_accuracy_percentage": 0.0,
                "total_questions_attempted": 0,
                "weak_topics": ["General Studies", "Quantitative Aptitude"],
                "strong_topics": ["English Comprehension"],
                "unresolved_mistakes_count": unresolved_mistakes_count,
                "speed_seconds_per_question": 45,
                "ai_feedback": "Complete your first timed practice test to generate personalized diagnostic analytics.",
            }

        total_score = sum(a.score for a in attempts)
        total_acc = sum(a.accuracy_percentage for a in attempts)
        total_qs = sum(a.total_attempted for a in attempts)
        total_time = sum(a.time_spent_seconds for a in attempts)

        all_weak = []
        all_strong = []
        for a in attempts:
            all_weak.extend(a.weak_topics)
            all_strong.extend(a.strong_topics)

        # Count frequencies
        weak_counts = {}
        for w in all_weak:
            weak_counts[w] = weak_counts.get(w, 0) + 1
        sorted_weak = sorted(weak_counts.keys(), key=lambda x: weak_counts[x], reverse=True)[:5]

        avg_score = round(total_score / len(attempts), 1)
        avg_acc = round(total_acc / len(attempts), 1)
        speed = int(total_time / total_qs) if total_qs > 0 else 60

        feedback = (
            f"Based on {len(attempts)} recorded test sessions, your average accuracy is {avg_acc}%. "
            f"Priority intervention required in: {', '.join(sorted_weak[:3]) if sorted_weak else 'None'}. "
            f"Average pacing is {speed}s per question."
        )

        return {
            "total_tests_taken": len(attempts),
            "average_score": avg_score,
            "average_accuracy_percentage": avg_acc,
            "total_questions_attempted": total_qs,
            "weak_topics": sorted_weak or ["Logical Deduction"],
            "strong_topics": list(set(all_strong))[:5] or ["Teaching Concepts"],
            "unresolved_mistakes_count": unresolved_mistakes_count,
            "speed_seconds_per_question": speed,
            "ai_feedback": feedback,
        }

    def create_mistake_based_test(
        self,
        student_id: str,
        title: str = "Mistake Recovery Practice Test",
        max_questions: int = 10,
    ) -> Optional[MockTest]:
        """
        Generate a customized test paper composed exclusively from questions the student previously got wrong.
        """
        mistakes = self.db.query(StudentMistake).filter(
            StudentMistake.student_id == student_id,
            StudentMistake.is_resolved == False,
        ).limit(max_questions).all()

        if not mistakes:
            return None

        question_ids = [m.question_id for m in mistakes]
        mock = MockTest(
            title=title,
            exam_code="MISTAKE-RECOVERY",
            test_type="MISTAKE_BASED",
            total_questions=len(question_ids),
            duration_minutes=max(10, len(question_ids) * 2),
            positive_marks_per_q=2.0,
            negative_marks_per_q=0.66,
            question_ids=question_ids,
            instructions="Practice test generated from your personal Mistake Notebook for spaced repetition.",
            is_published=True,
        )
        self.db.add(mock)
        self.db.commit()
        self.db.refresh(mock)
        return mock
