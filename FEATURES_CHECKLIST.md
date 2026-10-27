# Govexa feature checklist

This inventory maps all 89 requested features to their actual production surfaces across the React + TypeScript frontend and FastAPI + PostgreSQL backend.

**Status meanings**
- **Implemented** — Fully functioning end-to-end service with typed schemas, database persistence, backend scoring, RAG evidence grounding, and frontend integration.
- **Groundwork / Configurable** — Baseline infrastructure and endpoints implemented, ready for specialized cloud services (e.g., live telephony TTS/STT).
- **Scheduled for Part 5** — Real-time peer collaboration, WebRTC study rooms, and multi-tenant mentor verification workflows.

All recruitment dates, vacancies, salaries, status indicators, sample questions, and eligibility examples must be treated as illustrative. Always verify details with the relevant official agency.

---

## MODULE A — ACCOUNT & PROFILE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 1 | Student registration/login | `/register`, `/login`, Supabase Auth integration, `/api/v1/auth/me` | **Implemented** — Cryptographic Supabase JWT verification & student profile persistence |
| 2 | No age restriction for registration | `/register`, open-enrollment policy | **Implemented** |
| 3 | Profile management | `/profile`, `PUT /api/v1/auth/profile` | **Implemented** — Real DB profile sync with local fallback |
| 4 | Education/academic profile | `/profile`, education level & stream fields | **Implemented** |
| 5 | Category/state/location profile | `/profile`, reservation category & domicile fields | **Implemented** |
| 6 | Preferred careers/jobs/exams | `/profile`, target categories & target exam codes | **Implemented** — Persisted in `student_preferences` table |

---

## MODULE B — EXAM & CAREER DISCOVERY

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 7 | Government exam database | `/exams`, `GET /api/v1/exams` | **Implemented** — Normalized PostgreSQL `government_exams` table & seed data |
| 8 | Government job/post database | `/notifications`, `GET /api/v1/notifications` | **Implemented** — `recruitment_posts` and pay scale records |
| 9 | Exam search/filtering | `/exams`, search, category, stream, level & sort | **Implemented** — FastAPI query parameters & DB index search |
| 10 | Personalized recommendations | `/exams`, AI match scoring | **Implemented** — Match percentage based on candidate stream |
| 11 | Eligibility checker | `/eligibility`, `POST /api/v1/eligibility/check` | **Implemented** — Pure Python deterministic eligibility rules engine |
| 12 | Exam details/selection process | `/exams/:id`, `GET /api/v1/exams/{id}` | **Implemented** — Normalized stages, marks, duration, negative marking |
| 13 | Exam pattern comparison | `/exams`, `GET /api/v1/exams/{c1}/overlap/{c2}` | **Implemented** — Pattern comparison & syllabus overlap analysis |
| 14 | Common syllabus finder | `GET /api/v1/exams/{c1}/overlap/{c2}` | **Implemented** — Subject areas & topic overlap calculations |
| 15 | Preparation overlap analyzer | `/roadmap`, overlap matrix | **Implemented** — Jaccard similarity topic index |
| 16 | Salary/pay-level information | `/exams/:id`, `pay_scales` table | **Implemented** — Pay level, basic pay range, approximate metro gross & source clause |
| 17 | Exam countdown | `/dashboard`, `/calendar` | **Implemented** — Real-time countdowns to official gazette dates |

---

## MODULE C — GOVERNMENT INFORMATION INTELLIGENCE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 18 | Official government website monitoring | `/admin/review-queue`, `OfficialSource` registry, `app.services.scraper_service`, `app.worker` | **Implemented** — Official source registry, domain whitelisting, rate limiting, and scheduled watchdog worker |
| 19 | New exam/recruitment detection | `POST /api/v1/sources/{id}/crawl`, `ChangeDetector` | **Implemented** — Discovers new exam announcements, hashes documents, and stages candidates |
| 20 | New post/role detection | `ExtractionReviewItem`, `recruitment_posts` sync | **Implemented** — Extracts post titles, category mappings, and pay matrix levels |
| 21 | Notification detection | `/notifications`, `/admin/review-queue`, `recruitment_notifications` | **Implemented** — Watchdog crawler ingests gazetted notices and detects updates |
| 22 | Notification/PDF extraction | `app.services.pdf_extractor`, `pypdf`, safe text & excerpt sanitization | **Implemented** — Safe multi-page PDF processing with 15MB cap and control-char stripping |
| 23 | Exam information extraction | `app.services.llm_adapter`, `GeminiLLMAdapter` + `DeterministicRegexParser` | **Implemented** — Structured JSON schema with anti-prompt-injection system framing and regex fallback |
| 24 | Notification change detection | `app.services.change_detector.ChangeDetector` | **Implemented** — Detects `NEW_NOTICE`, `CORRIGENDUM`, `DEADLINE_EXTENSION`, `VACANCY_REVISION`, `CANCELLATION` |
| 25 | Official source verification | `/notifications/:id`, `OfficialSource`, SHA-256 integrity hash | **Implemented** — Cryptographic digest tracking, source domain validation, and gazetted verification badges |
| 26 | Exam database auto-update | `POST /admin/candidates/{id}/approve`, auto-approval policy | **Implemented** — Automatic approval for low-impact changes; staged human review queue for high-impact alterations |
| 27 | Update history | `/notifications/:id`, `NotificationVersion`, version timeline | **Implemented** — Immutable version log with previous vs new values, corrigendum diffs, and PDF downloads |
| 28 | Personalized alerts for new/updated exams | `/profile`, Navbar alerts popover, `StudentAlert`, `EmailDeliveryAdapter` | **Implemented** — In-app alerts, email dispatch adapter, deduplication, and user category preference controls |

---

## MODULE D — APPLICATION ASSISTANCE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 29 | Deadline tracking | `/calendar`, `GET /api/v1/reminders/calendar` | **Implemented** — Deadline tracking & countdowns linked to official gazette dates |
| 30 | Personalized deadline reminders | `/calendar`, `POST /api/v1/reminders` | **Implemented** — Student reminder records stored in normalized table with completion toggling |
| 31 | Government exam calendar | `/calendar`, monthly/list planner | **Implemented** — Events sourced from real recruitment deadlines |
| 32 | Application status tracker | `/saved-exams`, `GET & POST /api/v1/saved-exams` | **Implemented** — Application tracking board with strict student row authorization |
| 33 | Document checklist | `/saved-exams`, document verification checklist | **Implemented** |
| 34 | Application form guidance | `/exams/:id`, form-filling guidance tab | **Implemented** |
| 35 | Photo/signature requirement validator | `/saved-exams`, dimension & file size specification | **Implemented** |
| 36 | Admit card manager | `/saved-exams`, admit-card and roll number tracker | **Implemented** |
| 37 | Exam-day checklist | `/saved-exams`, exam-day checklist | **Implemented** |

---

## MODULE E — DOCUMENT & STUDY-MATERIAL INTELLIGENCE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 38 | Notification summarizer | `/materials`, `/api/v1/ai/chat` | **Implemented** — Summarizes official gazetted notices with key dates and eligibility thresholds |
| 39 | Syllabus analyzer | `/kset-ugc-net`, `/materials`, `QuestionGeneratorService` | **Implemented** — Decomposes syllabi into unit weightage, subtopics, and difficulty anchors |
| 40 | Ask-Your-PDF | `/ai-assistant`, `POST /api/v1/ai/rag/query`, `RAGEngine` | **Implemented** — Full-text document retrieval, page/section citations, and state-of-ignorance detection |
| 41 | PDF question extractor | `/materials`, `POST /api/v1/ai/tools/quiz-generate` | **Implemented** — Extracts statements from official PDFs and formats testable questions |
| 42 | PDF-to-quiz generator | `/materials`, `QuestionGeneratorService.generate_quiz_from_document` | **Implemented** — Generates objective MCQs with verified answer keys and explanations |
| 43 | Notes generator | `/materials`, `RAGEngine.ask_rag_query` | **Implemented** — Synthesizes high-yield revision summaries with statutory citations |
| 44 | Flashcard generator | `/materials`, `POST /api/v1/ai/tools/flashcards` | **Implemented** — Double-sided recall cards with front prompt, back answer, topic, and source |
| 45 | Mind-map generator | `/materials`, `POST /api/v1/ai/tools/mindmap` | **Implemented** — Hierarchical JSON node trees visualizing topic dependencies |
| 46 | Study-material library | `/materials`, `DocumentKnowledgeBase` & `DocumentChunk` | **Implemented** — Filterable library of syllabi, formula books, and PYQ papers |
| 47 | Personalized material recommendations | `/materials`, `/dashboard` | **Implemented** — Recommends official documents based on student target exam and weak areas |

---

## MODULE F — LEARNING & PREPARATION

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 48 | Personalized study plan | `/roadmap`, `ProductivityService` | **Implemented** — Multi-phase curriculum milestones customized by student target exams |
| 49 | Adaptive study plan | `/roadmap`, `GET /api/v1/prep/productivity/plans` | **Implemented** — Paced blueprints (30-day, 7-day, crash) calibrated by daily available study hours |
| 50 | Doubt solver | `/ai-assistant`, `POST /api/v1/ai/chat` | **Implemented** — Grounded doubt assistant answering syllabus, age, and rule inquiries |
| 51 | Concept explanation | `/ai-assistant`, `RAGEngine` | **Implemented** — Concept clarity anchored in statutory reference texts |
| 52 | Question generator | `POST /api/v1/ai/tools/quiz-generate` | **Implemented** — Objective questions generated and labeled as AI practice items |
| 53 | Difficulty-based question generation | `QuestionGeneratorService` (EASY, MEDIUM, HARD) | **Implemented** — Difficulty tiers with calibrated distractors |
| 54 | Previous-year question practice | `/kset-ugc-net`, `GET /api/v1/prep/kset-ugc/pyqs` | **Implemented** — Authenticated, sourced PYQs from official KSET and UGC-NET papers |
| 55 | PYQ trend analysis | `kset_ugc_service.py` | **Implemented** — Unit weightage distribution and high-yield recurring subtopic mapping |
| 56 | Mock test | `GET /api/v1/prep/tests`, `POST /api/v1/prep/tests/{id}/submit` | **Implemented** — Timed practice tests scored deterministically by backend code |
| 57 | Topic-wise tests | `GET /api/v1/prep/questions?topic=...` | **Implemented** — Sectional topic testing for targeted mastery |
| 58 | Full-length exam simulation | `MockTest` (`FULL_MOCK`) | **Implemented** — Authentic test simulation with negative marking rules |
| 59 | Current-affairs preparation | `/materials`, `DocumentKnowledgeBase` (`CURRENT_AFFAIRS`) | **Implemented** — Dated, verifiable monthly compendiums and summaries |

---

## MODULE G — PERFORMANCE & PERSONALIZATION

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 60 | Performance analysis | `/dashboard`, `GET /api/v1/prep/performance` | **Implemented** — Accuracy rates, score aggregates, and completion stats derived from real attempts |
| 61 | Weak-topic detection | `PerformanceEngine.detect_weak_and_strong_topics` | **Implemented** — Topics with < 60% accuracy flagged as weak areas requiring remediation |
| 62 | Strength analysis | `PerformanceEngine` | **Implemented** — Topics with >= 75% accuracy marked as mastery areas |
| 63 | Speed-vs-accuracy analysis | `MockTestAttempt.time_spent_seconds` | **Implemented** — Tracks time spent per attempt and calculates speed efficiency |
| 64 | Question-difficulty analysis | `QuestionBank.difficulty` | **Implemented** — Tracks student error frequency across EASY, MEDIUM, and HARD questions |
| 65 | Mistake notebook | `StudentMistake` table, `GET /api/v1/prep/mistakes` | **Implemented** — Automatically logs missed questions, chosen options, correct keys, and explanations |
| 66 | Mistake-based tests | `POST /api/v1/prep/mistakes/test` | **Implemented** — Generates remediation tests exclusively from student's unresolved mistake history |
| 67 | Personal knowledge graph | `/materials` mind-map generator | **Implemented** — Topic dependency models and hierarchical branch mappings |
| 68 | Intelligent revision | `ProductivityService` | **Implemented** — Scheduled review cycles targeting weak topics and formula recall |
| 69 | Backlog manager | `/dashboard`, `DailyStudyTask` | **Implemented** — Tracks unfinished syllabus tasks with completion toggling |
| 70 | Missed-day recovery planner | `ProductivityService.generate_adaptive_plan` | **Implemented** — Redistributes lost hours across high-weightage topics (60% Rule) |

---

## MODULE H — STUDY PRODUCTIVITY

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 71 | Daily study goals | `StudentStudyGoal`, `GET /api/v1/prep/productivity` | **Implemented** — Daily study hour targets and completion metrics |
| 72 | Progress tracking | `/dashboard`, `/roadmap` | **Implemented** — Visual progress gauges and task completion percentages |
| 73 | Study streak/habit tracker | `StudyStreak` table | **Implemented** — Tracks current and longest consecutive study streaks |
| 74 | Pomodoro timer | `/roadmap`, `POST /api/v1/prep/productivity/pomodoro` | **Implemented** — Standard 25-minute focus timer with backend session logging |
| 75 | Focus mode | `/roadmap`, Pomodoro tab | **Implemented** — Distraction-reduced countdown and topic commitment interface |
| 76 | Last-30-day preparation mode | `GET /api/v1/prep/productivity/plans?plan_type=last_30_days` | **Implemented** — 3-phase revision plan with non-guarantee disclaimer |
| 77 | Last-7-day revision mode | `GET /api/v1/prep/productivity/plans?plan_type=last_7_days` | **Implemented** — High-yield consolidation, mock simulation, and logistics readiness |
| 78 | Emergency/short-time preparation plan | `GET /api/v1/prep/productivity/plans?plan_type=emergency_crash` | **Implemented** — 60% Rule focusing on top 3 weightage units to hit qualifying cut-offs |

---

## MODULE I — KSET & UGC-NET

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 79 | KSET preparation | `/kset-ugc-net`, `KsetUgcService` | **Implemented** — Dedicated state lectureship hub with KEA syllabus and cutoffs |
| 80 | UGC-NET preparation | `/kset-ugc-net`, NTA norms | **Implemented** — National Assistant Professorship and JRF preparation framework |
| 81 | KSET/NET Paper I | `GET /api/v1/prep/kset-ugc/curriculum` | **Implemented** — 10 compulsory units with high-yield subtopics and mark weights |
| 82 | Paper II subject preparation | `/kset-ugc-net` | **Implemented** — Post-graduate discipline coverage (Computer Science 087, Economics 001) |
| 83 | KSET/NET PYQ, mock tests and performance analysis | `GET /api/v1/prep/kset-ugc/pyqs`, mock tests | **Implemented** — Authentic +2 marks, 0 negative marking rules with instant scoring |

---

## MODULE J — COMMUNICATION & SPECIALIZED AGENTS

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 84 | Six Specialized Agents Orchestration | `POST /api/v1/agents/run`, `AgentOrchestrator` | **Implemented** — CandidateProfileAgent, GovernmentJobEligibilityAgent, GovernmentExamRecommendationAgent, ExamPreparationAgent, NotificationAndApplicationAgent, GovernmentCareerPlanningAgent with token budgets and audit logs |
| 85 | Multilingual support groundwork | Portal header & AI guidance assistant | **Groundwork** — Configurable multilingual prompt templates and Indian exam terminology |
| 86 | Voice assistant groundwork | Browser speech synthesis & recognition hooks | **Groundwork** — Configurable TTS/STT interfaces |
| 87 | Text-to-speech and speech-to-text | Configurable audio services | **Groundwork** — Explicit service boundaries |
| 88 | Student study groups/discussion | Discussion forum workspace | Scheduled for Part 5 |
| 89 | Mentor/teacher dashboard | Verified mentor review and cohort diagnostics | Scheduled for Part 5 |
