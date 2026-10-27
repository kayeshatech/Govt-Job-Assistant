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

-- 6. Personalized Student Alerts (Part 3)
ALTER TABLE student_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own alerts"
    ON student_alerts FOR SELECT
    USING (auth.uid()::text = student_id OR auth.jwt()->'app_metadata'->>'role' = 'admin');

CREATE POLICY "Students can update own alerts"
    ON student_alerts FOR UPDATE
    USING (auth.uid()::text = student_id)
    WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can delete own alerts"
    ON student_alerts FOR DELETE
    USING (auth.uid()::text = student_id);

-- 7. Official Source Registry & Review Queue (Part 3)
ALTER TABLE official_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read official_sources"
    ON official_sources FOR SELECT
    USING (true);

CREATE POLICY "Admins manage official_sources"
    ON official_sources FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins manage extraction_review_items"
    ON extraction_review_items FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

-- 8. Public Reference Tables (Read-only for public/authenticated, write for admin/service_role)
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

-- 9. Audit Logs: Admin read-only, service_role write
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

-- 10. RAG Knowledge Bases and Chunks (Part 4)
ALTER TABLE document_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read document_knowledge_bases" ON document_knowledge_bases FOR SELECT USING (true);
CREATE POLICY "Admins manage document_knowledge_bases" ON document_knowledge_bases FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Public read document_chunks" ON document_chunks FOR SELECT USING (true);
CREATE POLICY "Admins manage document_chunks" ON document_chunks FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

-- 11. Question Bank & Standardized Mock Tests (Part 4)
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read question_bank" ON question_bank FOR SELECT USING (true);
CREATE POLICY "Admins manage question_bank" ON question_bank FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Public read mock_tests" ON mock_tests FOR SELECT USING (true);
CREATE POLICY "Admins manage mock_tests" ON mock_tests FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

-- 12. Student Practice Attempts, Mistakes, Goals, Pomodoro, and Streaks (Part 4)
ALTER TABLE mock_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own mock test attempts" ON mock_test_attempts FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Students manage own mistakes" ON student_mistakes FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Students manage own goals" ON student_study_goals FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Students manage own pomodoro sessions" ON pomodoro_sessions FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Students manage own streaks" ON study_streaks FOR ALL USING (auth.uid()::text = student_id);

-- 13. Agent Execution Audits (Part 4)
ALTER TABLE agent_execution_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view agent execution audits" ON agent_execution_audits FOR SELECT
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

-- 14. Collaborative Study Groups (Part 5 - Feature 88)
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read study_groups" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users create study_groups" ON study_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Group creators manage study_groups" ON study_groups FOR UPDATE USING (auth.uid()::text = created_by OR auth.jwt()->'app_metadata'->>'role' = 'admin');

-- 15. Group Discussion Messages (Part 5 - Feature 88 & 89)
ALTER TABLE group_discussion_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read group_discussion_messages" ON group_discussion_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users insert messages" ON group_discussion_messages FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Message owners or mentors edit messages" ON group_discussion_messages FOR UPDATE USING (auth.uid()::text = user_id OR auth.jwt()->'app_metadata'->>'role' = 'admin');

-- 16. Mentor Profiles (Part 5 - Feature 89)
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mentor_profiles" ON mentor_profiles FOR SELECT USING (true);
CREATE POLICY "Admins manage mentor_profiles" ON mentor_profiles FOR ALL
    USING (auth.jwt()->'app_metadata'->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

