# Govexa feature checklist

This inventory maps all 89 requested features to their current frontend surface. The existing pages are retained; new browser-side learning tools live in the Study Workspace. The application is a static academic prototype with no server, AI model, scheduled monitor, or notification provider.

**Status meanings**

- **Implemented** — a working browser-side interaction is present; data may still be local/demo data.
- **Simulated/demo** — a usable presentation or deterministic sample interaction is present, but it is not a live or authoritative service.
- **Requires backend/external service** — the interface or sample surface exists, but the requested live capability needs an unconnected service.

All recruitment dates, vacancies, salaries, status indicators, sample questions, and eligibility examples must be treated as illustrative. Always verify details with the relevant official agency.

## MODULE A — ACCOUNT & PROFILE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 1 | Student registration/login | [register.html](./register.html), [login.html](./login.html); local demo session in `assets/js/app.js` | Simulated/demo — no secure account service |
| 2 | No age restriction for registration | [register.html](./register.html), open-enrollment note | Implemented |
| 3 | Profile management | [profile.html](./profile.html), profile form and local storage | Implemented |
| 4 | Education/academic profile | [profile.html](./profile.html), education fields | Implemented |
| 5 | Category/state/location profile | [profile.html](./profile.html), category and domicile fields | Implemented |
| 6 | Preferred careers/jobs/exams | [profile.html](./profile.html), preference form and target checkboxes | Implemented |

## MODULE B — EXAM & CAREER DISCOVERY

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 7 | Government exam database | [exams.html](./exams.html), `GOV_EXAMS_DATA` in `assets/js/data.js` | Simulated/demo — curated sample entries |
| 8 | Government job/post database | [exams.html](./exams.html), jobs tab and `GOV_JOBS_DATABASE` | Simulated/demo — sample posts |
| 9 | Exam search/filtering | [exams.html](./exams.html), search, category, stream, level and sort controls | Implemented |
| 10 | Personalized recommendations | [exams.html](./exams.html), recommendations tab | Simulated/demo — static sample scores |
| 11 | Eligibility checker | [exams.html](./exams.html), checker tab; [profile.html](./profile.html), eligibility matrix | Simulated/demo — illustrative rules; verify agency notice |
| 12 | Exam details/selection process | [exams.html](./exams.html), exam detail modal in `assets/js/app.js` | Simulated/demo — sample exam records |
| 13 | Exam pattern comparison | [exam-compare.html](./exam-compare.html), comparison table | Simulated/demo — sample patterns |
| 14 | Common syllabus finder | [exam-compare.html](./exam-compare.html), overlap topics | Simulated/demo — sample topic mapping |
| 15 | Preparation overlap analyzer | [exam-compare.html](./exam-compare.html), overlap matrix and estimate | Simulated/demo — heuristic/sample percentages |
| 16 | Salary/pay-level information | [exams.html](./exams.html), job cards and exam details | Simulated/demo — indicative sample values |
| 17 | Exam countdown | [dashboard.html](./dashboard.html), [calendar.html](./calendar.html), [exam-compare.html](./exam-compare.html) | Implemented — counts down to sample dates |

## MODULE C — GOVERNMENT INFORMATION INTELLIGENCE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 18 | Official government website monitoring | [intelligence.html](./intelligence.html), monitored portals table | Requires backend/external service |
| 19 | New exam/recruitment detection | [intelligence.html](./intelligence.html), sample extraction feed | Requires backend/external service |
| 20 | New post/role detection | [intelligence.html](./intelligence.html), sample recruitment feed | Requires backend/external service |
| 21 | Notification detection | [notifications.html](./notifications.html), sample notification feed | Requires backend/external service |
| 22 | Notification/PDF extraction | [intelligence.html](./intelligence.html), extraction tab; [workspace.html](./workspace.html#documents), PDF selector | Requires backend/external service |
| 23 | Exam information extraction | [intelligence.html](./intelligence.html), extracted sample fields | Requires backend/external service |
| 24 | Notification change detection | [intelligence.html](./intelligence.html), sample corrigendum diff view | Requires backend/external service |
| 25 | Official source verification | [intelligence.html](./intelligence.html), source labels/links | Requires backend/external service |
| 26 | Exam database auto-update | [intelligence.html](./intelligence.html), sample audit log | Requires backend/external service |
| 27 | Update history | [intelligence.html](./intelligence.html), audit-log tab | Simulated/demo — static sample records |
| 28 | Personalized alerts for new/updated exams | [notifications.html](./notifications.html), subscription control | Requires backend/external service |

## MODULE D — APPLICATION ASSISTANCE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 29 | Deadline tracking | [calendar.html](./calendar.html), exam dates and reminder list | Implemented — local sample dates |
| 30 | Personalized deadline reminders | [calendar.html](./calendar.html), custom reminders in local storage | Simulated/demo — no scheduled push/email delivery |
| 31 | Government exam calendar | [calendar.html](./calendar.html), month and list views | Implemented — events use sample dates |
| 32 | Application status tracker | [applications.html](./applications.html), tracker tab and local records | Implemented — browser-local records |
| 33 | Document checklist | [applications.html](./applications.html), document verification checklist | Implemented — local checklist state |
| 34 | Application form guidance | [applications.html](./applications.html), form-filling guidance tab | Simulated/demo — generic guidance |
| 35 | Photo/signature requirement validator | [applications.html](./applications.html), validator tab and `validateUploadFile()` | Simulated/demo — sample specifications; confirm official notice |
| 36 | Admit card manager | [applications.html](./applications.html), admit-card tab | Simulated/demo — example records/cards only |
| 37 | Exam-day checklist | [applications.html](./applications.html), exam-day checklist tab | Implemented — local checklist; confirm exam-specific rules |

## MODULE E — DOCUMENT & STUDY-MATERIAL INTELLIGENCE

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 38 | Notification summarizer | [workspace.html](./workspace.html#documents), pasted-text summary control | Simulated/demo — local excerpt formatting; PDF/AI service is not connected |
| 39 | Syllabus analyzer | [workspace.html](./workspace.html#documents), local text and keyword tools | Simulated/demo |
| 40 | Ask-Your-PDF | [workspace.html](./workspace.html#documents), PDF selector and text-entry workspace | Requires backend/external service |
| 41 | PDF question extractor | [workspace.html](./workspace.html#documents), prompt finder for pasted text | Requires backend/external service for PDF extraction |
| 42 | PDF-to-quiz generator | [workspace.html](./workspace.html#documents), cloze sample quiz from pasted text | Simulated/demo — PDF parsing is not connected |
| 43 | Notes generator | [workspace.html](./workspace.html#documents), local notes formatter | Simulated/demo |
| 44 | Flashcard generator | [workspace.html](./workspace.html#documents), revealable sample cards | Simulated/demo |
| 45 | Mind-map generator | [workspace.html](./workspace.html#documents), keyword grouping | Simulated/demo |
| 46 | Study-material library | [workspace.html](./workspace.html#documents), library links and reference list | Simulated/demo — short curated list |
| 47 | Personalized material recommendations | [workspace.html](./workspace.html#documents), sample material suggestions | Simulated/demo |

## MODULE F — LEARNING & PREPARATION

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 48 | Personalized study plan | [workspace.html](./workspace.html#learning), saved daily hours | Implemented — user-configured local plan |
| 49 | Adaptive study plan | [workspace.html](./workspace.html#learning), rule-based adjustment control | Simulated/demo |
| 50 | Doubt solver | [workspace.html](./workspace.html#learning), local doubt notes; AI not connected | Requires backend/external service for automated solving |
| 51 | Concept explanation | [workspace.html](./workspace.html#learning), static sample concept desk | Simulated/demo |
| 52 | Question generator | [workspace.html](./workspace.html#learning), sample question bank and text cloze generator | Simulated/demo |
| 53 | Difficulty-based question generation | [workspace.html](./workspace.html#learning), sample practice questions | Simulated/demo — no difficulty model |
| 54 | Previous-year question practice | [workspace.html](./workspace.html#learning), sample practice bank | Simulated/demo — not an authenticated PYQ archive |
| 55 | PYQ trend analysis | [workspace.html](./workspace.html#analytics), local practice summaries | Simulated/demo — no verified historical PYQ corpus |
| 56 | Mock test | [preparation.html](./preparation.html), timed sample mock in `assets/js/app.js` | Implemented — small sample question bank |
| 57 | Topic-wise tests | [workspace.html](./workspace.html#learning), topic selector and practice interaction | Implemented — sample question bank |
| 58 | Full-length exam simulation | [preparation.html](./preparation.html), timed sample test | Simulated/demo — not a full official-length paper |
| 59 | Current-affairs preparation | [workspace.html](./workspace.html#learning), static revision prompts | Simulated/demo — no live news feed |

## MODULE G — PERFORMANCE & PERSONALIZATION

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 60 | Performance analysis | [workspace.html](./workspace.html#analytics), local test/practice summary | Implemented — browser-local activity only |
| 61 | Weak-topic detection | [workspace.html](./workspace.html#analytics), rule-based practice accuracy | Simulated/demo — limited sample |
| 62 | Strength analysis | [workspace.html](./workspace.html#analytics), rule-based practice accuracy | Simulated/demo — limited sample |
| 63 | Speed-vs-accuracy analysis | [workspace.html](./workspace.html#analytics), timed test history | Simulated/demo — simple metrics only |
| 64 | Question-difficulty analysis | [workspace.html](./workspace.html#analytics), practice and sample results | Simulated/demo — no calibrated difficulty data |
| 65 | Mistake notebook | [workspace.html](./workspace.html#analytics), local mistake notes | Implemented |
| 66 | Mistake-based tests | [workspace.html](./workspace.html#analytics), mistake/revision queue | Simulated/demo — manual review queue |
| 67 | Personal knowledge graph | [workspace.html](./workspace.html#analytics), topic summary panel | Simulated/demo — not a graph model |
| 68 | Intelligent revision | [workspace.html](./workspace.html#analytics), mark-reviewed and revision queue | Simulated/demo — local rule-based queue |
| 69 | Backlog manager | [workspace.html](./workspace.html#analytics), backlog form and completion control | Implemented |
| 70 | Missed-day recovery planner | [workspace.html](./workspace.html#analytics), recovery-plan control | Simulated/demo — generic rule-based suggestion |

## MODULE H — STUDY PRODUCTIVITY

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 71 | Daily study goals | [workspace.html](./workspace.html#productivity), local minutes target | Implemented |
| 72 | Progress tracking | [workspace.html](./workspace.html#productivity), study log and progress display | Implemented — browser-local data |
| 73 | Study streak/habit tracker | [workspace.html](./workspace.html#productivity), local day activity summary | Simulated/demo — basic activity history |
| 74 | Pomodoro timer | [workspace.html](./workspace.html#productivity), start/pause/reset timer | Implemented |
| 75 | Focus mode | [workspace.html](./workspace.html#productivity), distraction-reduced workspace view | Implemented |
| 76 | Last-30-day preparation mode | [workspace.html](./workspace.html#productivity), generic 30-day outline | Simulated/demo |
| 77 | Last-7-day revision mode | [workspace.html](./workspace.html#productivity), generic 7-day outline | Simulated/demo |
| 78 | Emergency/short-time preparation plan | [workspace.html](./workspace.html#productivity), short-time outline | Simulated/demo |

## MODULE I — KSET & UGC-NET

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 79 | KSET preparation | [workspace.html](./workspace.html#kset-net), KSET/NET preparation cell | Simulated/demo — sample topics |
| 80 | UGC-NET preparation | [workspace.html](./workspace.html#kset-net), KSET/NET preparation cell | Simulated/demo — sample topics |
| 81 | KSET/NET Paper I | [workspace.html](./workspace.html#kset-net), Paper I selector | Simulated/demo — topic outline/sample questions |
| 82 | Paper II subject preparation | [workspace.html](./workspace.html#kset-net), Computer Science Paper II selector | Simulated/demo — sample topics |
| 83 | KSET/NET PYQ, mock tests and performance analysis | [workspace.html](./workspace.html#kset-net), [preparation.html](./preparation.html), [workspace.html](./workspace.html#analytics) | Simulated/demo — small sample bank and local analytics |

## MODULE J — COMMUNICATION & COMMUNITY

| # | Feature | Page / component | Status |
|---:|---|---|---|
| 84 | AI career guidance assistant | [workspace.html](./workspace.html#community), career guidance response panel | Requires backend/external service for AI; local sample response is available |
| 85 | Multilingual support | Shared language selector in [workspace.html](./workspace.html#settings) and portal header | Simulated/demo — preference is saved; UI translation is not connected |
| 86 | Voice assistant | [workspace.html](./workspace.html#community), browser speech controls | Simulated/demo — depends on browser speech support |
| 87 | Text-to-speech and speech-to-text | [workspace.html](./workspace.html#community), browser speech APIs | Simulated/demo — browser/device support required |
| 88 | Student study groups/discussion | [workspace.html](./workspace.html#community), local discussion board | Simulated/demo — posts are not shared or synced |
| 89 | Mentor/teacher dashboard | [workspace.html](./workspace.html#community), mentor view preview | Simulated/demo — no roles, permissions, or shared backend |
