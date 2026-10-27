from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.preparation import StudentStudyGoal, PomodoroSession, StudyStreak

class ProductivityService:
    """
    Manages daily student goals, Pomodoro focus tracking, study streaks,
    and adaptive 30-day, 7-day, and emergency crash preparation plans.
    """

    def __init__(self, db: Session):
        self.db = db

    def log_pomodoro_session(
        self,
        student_id: str,
        duration_minutes: int = 25,
        topic: str = "General Study",
    ) -> PomodoroSession:
        """Record completed Pomodoro focus session and advance study streak."""
        session = PomodoroSession(
            student_id=student_id,
            duration_minutes=duration_minutes,
            topic=topic,
            completed_at=datetime.now(timezone.utc),
        )
        self.db.add(session)

        # Update daily study goal
        today = date.today()
        goal = self.db.query(StudentStudyGoal).filter(
            StudentStudyGoal.student_id == student_id,
            StudentStudyGoal.target_date == today,
        ).first()

        hours_completed = duration_minutes / 60.0
        if goal:
            goal.completed_hours += hours_completed
            if goal.completed_hours >= goal.goal_hours:
                goal.is_completed = True
        else:
            goal = StudentStudyGoal(
                student_id=student_id,
                target_date=today,
                goal_hours=6.0,
                completed_hours=hours_completed,
                is_completed=hours_completed >= 6.0,
            )
            self.db.add(goal)

        # Update streak
        self._update_streak(student_id, today)

        self.db.commit()
        self.db.refresh(session)
        return session

    def _update_streak(self, student_id: str, today: date) -> StudyStreak:
        streak = self.db.query(StudyStreak).filter(
            StudyStreak.student_id == student_id
        ).first()

        if not streak:
            streak = StudyStreak(
                student_id=student_id,
                current_streak_days=1,
                longest_streak_days=1,
                last_active_date=today,
            )
            self.db.add(streak)
            return streak

        if streak.last_active_date == today:
            return streak
        elif streak.last_active_date == today - timedelta(days=1):
            streak.current_streak_days += 1
            if streak.current_streak_days > streak.longest_streak_days:
                streak.longest_streak_days = streak.current_streak_days
            streak.last_active_date = today
        else:
            streak.current_streak_days = 1
            streak.last_active_date = today

        return streak

    def get_productivity_status(self, student_id: str) -> Dict[str, Any]:
        """Fetch today's goal, current streak, and weekly focus metrics."""
        today = date.today()
        goal = self.db.query(StudentStudyGoal).filter(
            StudentStudyGoal.student_id == student_id,
            StudentStudyGoal.target_date == today,
        ).first()

        streak = self.db.query(StudyStreak).filter(
            StudyStreak.student_id == student_id
        ).first()

        # Last 7 days sessions
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_sessions = self.db.query(PomodoroSession).filter(
            PomodoroSession.student_id == student_id,
            PomodoroSession.completed_at >= seven_days_ago,
        ).all()

        total_focus_minutes = sum(s.duration_minutes for s in recent_sessions)

        return {
            "today_date": str(today),
            "goal_hours": goal.goal_hours if goal else 6.0,
            "completed_hours": round(goal.completed_hours if goal else 0.0, 2),
            "goal_progress_percentage": min(100, int(((goal.completed_hours if goal else 0.0) / 6.0) * 100)),
            "current_streak_days": streak.current_streak_days if streak else 1,
            "longest_streak_days": streak.longest_streak_days if streak else 1,
            "last_7_days_focus_hours": round(total_focus_minutes / 60.0, 1),
            "pomodoro_sessions_count_last_7_days": len(recent_sessions),
        }

    def generate_adaptive_plan(
        self,
        plan_type: str = "last_30_days", # "last_30_days", "last_7_days", "emergency_crash"
        daily_available_hours: float = 6.0,
        target_exam: str = "UPSC CSE 2026",
    ) -> Dict[str, Any]:
        """
        Generate paced, adjustable study plans tailored to timeline constraints.
        Note: The plan is a pedagogical guide and never promises guaranteed selection.
        """
        if plan_type == "last_7_days":
            return {
                "plan_type": "Last 7 Days Final Revision Blueprint",
                "target_exam": target_exam,
                "daily_allocated_hours": daily_available_hours,
                "disclaimer": "This revision blueprint provides high-yield consolidation and does not guarantee exam selection.",
                "phases": [
                    {
                        "days": "Day 1 - Day 3",
                        "title": "High-Yield Unit Consolidation & Mistake Notebook Sweep",
                        "focus_hours_per_day": daily_available_hours,
                        "tasks": [
                            "Review all saved questions in personal Mistake Notebook",
                            "Consolidate formula sheets, statutory dates, and high-frequency abbreviations",
                            "Zero new conceptual topics — reinforce existing memory anchors",
                        ],
                    },
                    {
                        "days": "Day 4 - Day 5",
                        "title": "Strict Time-Bound Full Mock Simulation",
                        "focus_hours_per_day": daily_available_hours,
                        "tasks": [
                            "Complete 2 full-length timed tests strictly matching commission morning/afternoon slots",
                            "Practice question elimination tactics and negative-marking risk control",
                        ],
                    },
                    {
                        "days": "Day 6 - Day 7",
                        "title": "Mindset Calibration & Logistics Readiness",
                        "focus_hours_per_day": min(4.0, daily_available_hours),
                        "tasks": [
                            "Print official admit card, verify exam center location and original photo ID",
                            "Light 2-hour formula scan and sleep cycle alignment (8 hours restful sleep)",
                        ],
                    },
                ],
            }

        elif plan_type == "emergency_crash":
            return {
                "plan_type": "Emergency Qualifying Crash Strategy",
                "target_exam": target_exam,
                "daily_allocated_hours": max(4.0, daily_available_hours),
                "disclaimer": "Emergency survival strategy targeting the minimum statutory qualifying threshold. This plan does not guarantee selection, which is subject to competitive rank cut-offs.",
                "phases": [
                    {
                        "days": "Core Strategy",
                        "title": "Focus Exclusively on the Top 3 High-Weightage Units (60% Rule)",
                        "focus_hours_per_day": daily_available_hours,
                        "tasks": [
                            "Divert 70% of available hours to the 3 highest weightage topics (e.g. Teaching/Research Aptitude or Core Tech)",
                            "Skip low-yield secondary topics to avoid cognitive overload",
                            "Practice 50 PYQ questions daily with immediate answer key review",
                            "Eliminate negative guesses — answer only questions with >= 50% subjective certainty",
                        ],
                    },
                ],
            }

        else: # last_30_days default
            return {
                "plan_type": "Last 30 Days Paced Syllabus Mastery Blueprint",
                "target_exam": target_exam,
                "daily_allocated_hours": daily_available_hours,
                "disclaimer": "Structured curriculum roadmap. This preparation blueprint is a strategic study guide and does not guarantee exam selection.",
                "phases": [
                    {
                        "days": "Day 1 - Day 12",
                        "title": "Comprehensive Topic Mastery & Weak-Area Remediation",
                        "focus_hours_per_day": daily_available_hours,
                        "tasks": [
                            "Complete structured revision of all 10 syllabus modules",
                            "Spend 2 hours daily on diagnostic weak topics identified in performance analytics",
                            "Topic-wise mini practice tests (25 questions daily)",
                        ],
                    },
                    {
                        "days": "Day 13 - Day 22",
                        "title": "Full-Length Mock Testing & Accuracy Calibration",
                        "focus_hours_per_day": daily_available_hours,
                        "tasks": [
                            "Take 1 full-length simulation test every 48 hours under authentic exam conditions",
                            "Detailed 2-hour post-test analysis: categorize errors into conceptual vs careless mistakes",
                            "Update Mistake Notebook after every test attempt",
                        ],
                    },
                    {
                        "days": "Day 23 - Day 30",
                        "title": "Final Revision, Formula Recall & Examination Peak",
                        "focus_hours_per_day": daily_available_hours,
                        "tasks": [
                            "Active recall using flashcards and mind-maps",
                            "Final sweep of official previous-year papers from the last 3 years",
                            "Stabilize mental stamina and exam-day pacing routines",
                        ],
                    },
                ],
            }
