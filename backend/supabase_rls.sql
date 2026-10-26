-- ==============================================================================
-- Govexa: PostgreSQL Row Level Security (RLS) Policies for Supabase
-- Run this script in the Supabase SQL Editor to enforce database-level authorization.
-- ==============================================================================

-- 1. Student Profiles: Students can only read and update their own profile
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can select own profile"
    ON student_profiles FOR SELECT
    USING (auth.uid()::text = id OR auth.jwt()->>'role' = 'service_role' OR auth.jwt()->'app_metadata'->>'role' = 'admin');

CREATE POLICY "Students can update own profile"
    ON student_profiles FOR UPDATE
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Students can insert own profile"
    ON student_profiles FOR INSERT
    WITH CHECK (auth.uid()::text = id);

-- 2. Student Preferences
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can access own preferences"
    ON student_preferences FOR ALL
    USING (auth.uid()::text = student_id);

-- 3. Saved Examinations & Application Tracker: Isolated per student
ALTER TABLE saved_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can select own saved applications"
    ON saved_exams FOR SELECT
    USING (auth.uid()::text = student_id OR auth.jwt()->'app_metadata'->>'role' = 'admin');

CREATE POLICY "Students can insert own saved applications"
    ON saved_exams FOR INSERT
    WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can update own saved applications"
    ON saved_exams FOR UPDATE
    USING (auth.uid()::text = student_id)
    WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can delete own saved applications"
    ON saved_exams FOR DELETE
    USING (auth.uid()::text = student_id);

-- 4. Student Reminders
ALTER TABLE student_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own reminders"
    ON student_reminders FOR ALL
    USING (auth.uid()::text = student_id);

-- 5. Study Plans & Daily Tasks
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own study plans"
    ON study_plans FOR ALL
    USING (auth.uid()::text = student_id);

CREATE POLICY "Students can manage own daily tasks"
    ON daily_study_tasks FOR ALL
    USING (auth.uid()::text = student_id);

-- 6. Public Reference Tables (Read-only for public/authenticated, write for admin/service_role)
ALTER TABLE government_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_relaxation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_domicile_rules ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active government examinations & notices
CREATE POLICY "Public read government_exams" ON government_exams FOR SELECT USING (true);
CREATE POLICY "Public read exam_authorities" ON exam_authorities FOR SELECT USING (true);
CREATE POLICY "Public read exam_categories" ON exam_categories FOR SELECT USING (true);
CREATE POLICY "Public read exam_stages" ON exam_stages FOR SELECT USING (true);
CREATE POLICY "Public read syllabus_topics" ON syllabus_topics FOR SELECT USING (true);
CREATE POLICY "Public read pay_scales" ON pay_scales FOR SELECT USING (true);
CREATE POLICY "Public read recruitment_notifications" ON recruitment_notifications FOR SELECT USING (true);
CREATE POLICY "Public read recruitment_posts" ON recruitment_posts FOR SELECT USING (true);
CREATE POLICY "Public read notification_versions" ON notification_versions FOR SELECT USING (true);
CREATE POLICY "Public read qualification_rules" ON qualification_rules FOR SELECT USING (true);
CREATE POLICY "Public read age_criteria" ON age_criteria FOR SELECT USING (true);
CREATE POLICY "Public read age_relaxation_rules" ON age_relaxation_rules FOR SELECT USING (true);
CREATE POLICY "Public read community_domicile_rules" ON community_domicile_rules FOR SELECT USING (true);

-- 7. Audit Logs: Admin read-only, service_role write
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');
