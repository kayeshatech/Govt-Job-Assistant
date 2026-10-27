# Govexa Security Hardening & Privacy Architecture

This document outlines the security controls, cryptographic protections, threat mitigations, and regulatory compliance implementations in Govexa.

---

## 1. Authentication & Authorization

- **Cryptographic Tokens**: Uses Supabase Auth HMAC-SHA256 signed JSON Web Tokens (JWT).
- **Signature Verification**: Every request to protected API routes undergoes verification against the backend `SUPABASE_JWT_SECRET`.
- **Role-Based Access Control (RBAC)**: Distinguishes between standard student aspirants (`student`) and administrative reviewers (`admin`). Admin actions (such as managing official sources or approving extracted gazettes) strictly require an `admin` role claim.

---

## 2. Supabase Row Level Security (RLS)

All sensitive tables enforce database-level access isolation through PostgreSQL RLS (`backend/supabase_rls.sql`):
- `student_profiles`: Read/write restricted to `auth.uid() = id`.
- `saved_exams`, `student_alerts`, `student_reminders`, `study_plans`, `mock_test_attempts`, `student_mistakes`: Strictly isolated to `auth.uid() = student_id`.
- Public reference tables (`government_exams`, `syllabus_topics`, `pay_scales`, `recruitment_notifications`): Public read-only; write access restricted to `service_role` and `admin`.

---

## 3. Server-Side Request Forgery (SSRF) Defense

The official recruitment watchdog service (`app/services/scraper_service.py`) enforces multi-layered SSRF protection:
- **Protocol Whitelist**: Rejects all non-`http` / non-`https` schemes (e.g., `file://`, `ftp://`, `gopher://`).
- **Loopback & Localhost Rejection**: Blocks `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`.
- **Cloud Metadata Firewall**: Blocks AWS/GCP/Azure instance metadata endpoints (`169.254.169.254`, `metadata.google.internal`, `instance-data`).
- **Private Subnet Blocking**: Validates resolved IP addresses with Python's `ipaddress` library, denying private RFC-1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- **Domain Whitelist**: Only permits crawls from registered official commissions (e.g., `upsc.gov.in`, `ssc.gov.in`, `isro.gov.in`, `karnataka.gov.in`).

---

## 4. Anti-Prompt Injection Defense

In both the notification ingestion pipeline and the Ask-Your-PDF RAG assistant:
- Document excerpts are strictly enclosed in delimiter tags (`<recruitment_document>...</recruitment_document>`).
- System instructions explicitly direct the LLM to treat document text as untrusted raw evidence rather than executable instructions.
- Prompt injection canary phrases ("Ignore all previous instructions", "SYSTEM OVERRIDE", "reveal credentials") are systematically filtered out before chunk embedding.

---

## 5. Cross-Site Scripting (XSS) & Input Sanitization

- User-submitted inputs in community discussion circles, study group names, descriptions, and doubts are sanitized with Python's `html.escape()`.
- Dangerous characters (`<`, `>`, `&`, `"`, `'`) are converted to HTML entities, neutralizing stored XSS attacks.
- Frontend React JSX provides context-aware HTML escaping by default.

---

## 6. SQL Injection Neutralization

- All database queries use SQLAlchemy 2.x declarative models and parameterized queries.
- Raw string concatenations inside SQL execution blocks are strictly prohibited across the codebase.

---

## 7. Rate Limiting & Usage Safeguards

- Operational metrics endpoint (`/api/v1/metrics`) monitors request velocity.
- Default limit: 60 requests/minute per IP.
- AI token quotas: Maximum daily LLM token consumption limits prevent Denial-of-Wallet attacks.

---

## 8. Data Privacy: DPDP Act 2023 & GDPR Compliance

In compliance with India's **Digital Personal Data Protection Act (DPDP Act 2023)** and GDPR:
- **Right to Erasure**: `DELETE /api/v1/auth/account` allows students to permanently purge their account.
- **Cascade Deletion**: Automatically wipes records across all 11 student-specific tables:
  1. `student_preferences`
  2. `saved_exams`
  3. `student_reminders`
  4. `student_alerts`
  5. `study_plans`
  6. `daily_study_tasks`
  7. `mock_test_attempts`
  8. `student_mistakes`
  9. `student_study_goals`
  10. `pomodoro_sessions`
  11. `study_streaks`
  Before permanently deleting the root `student_profiles` row.
