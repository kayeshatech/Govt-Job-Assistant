"""Initial normalized schema for Govexa

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-26 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Authorities & Categories
    op.create_table(
        'exam_authorities',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('portal_type', sa.String(length=50), nullable=False),
        sa.Column('website_url', sa.String(length=500), nullable=False),
        sa.Column('state_jurisdiction', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_exam_authorities_code', 'exam_authorities', ['code'], unique=True)

    op.create_table(
        'exam_categories',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_exam_categories_code', 'exam_categories', ['code'], unique=True)

    # 2. Government Exams
    op.create_table(
        'government_exams',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('level', sa.String(length=50), nullable=False),
        sa.Column('posts_summary', sa.Text(), nullable=False),
        sa.Column('vacancies_count', sa.Integer(), nullable=False),
        sa.Column('min_qualification_summary', sa.Text(), nullable=False),
        sa.Column('eligible_streams', sa.JSON(), nullable=True),
        sa.Column('attempts_info', sa.JSON(), nullable=True),
        sa.Column('negative_marking', sa.String(length=150), nullable=False),
        sa.Column('duration_info', sa.String(length=150), nullable=False),
        sa.Column('relevance_for_tech', sa.Text(), nullable=True),
        sa.Column('official_website', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('authority_id', sa.String(length=36), nullable=False),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['authority_id'], ['exam_authorities.id']),
        sa.ForeignKeyConstraint(['category_id'], ['exam_categories.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_government_exams_slug', 'government_exams', ['slug'], unique=True)
    op.create_index('ix_government_exams_code', 'government_exams', ['code'], unique=False)

    # 3. Stages, Syllabus, Pay
    op.create_table(
        'exam_stages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('stage_order', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('stage_type', sa.String(length=50), nullable=False),
        sa.Column('details', sa.Text(), nullable=False),
        sa.Column('total_marks', sa.Integer(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('is_qualifying_only', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'syllabus_topics',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('stage_id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('subject_area', sa.String(length=150), nullable=False),
        sa.Column('topic_name', sa.String(length=255), nullable=False),
        sa.Column('topic_details', sa.Text(), nullable=True),
        sa.Column('is_core_overlap', sa.Boolean(), nullable=False),
        sa.Column('overlap_keywords', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['stage_id'], ['exam_stages.id']),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'pay_scales',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('post_name', sa.String(length=200), nullable=False),
        sa.Column('pay_level', sa.String(length=50), nullable=False),
        sa.Column('basic_pay_min', sa.Integer(), nullable=False),
        sa.Column('basic_pay_max', sa.Integer(), nullable=False),
        sa.Column('gross_approx_metro', sa.String(length=100), nullable=False),
        sa.Column('source_clause', sa.String(length=255), nullable=False),
        sa.Column('official_source_url', sa.String(length=500), nullable=False),
        sa.Column('effective_date', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # 4. Eligibility Rules
    op.create_table(
        'qualification_rules',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('min_degree_level', sa.String(length=100), nullable=False),
        sa.Column('allowed_streams', sa.JSON(), nullable=True),
        sa.Column('min_aggregate_percentage', sa.Float(), nullable=False),
        sa.Column('final_year_eligible', sa.Boolean(), nullable=False),
        sa.Column('mandatory_subjects', sa.JSON(), nullable=True),
        sa.Column('official_clause_reference', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'age_criteria',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('min_age', sa.Integer(), nullable=False),
        sa.Column('max_age_general', sa.Integer(), nullable=False),
        sa.Column('cutoff_reference_date', sa.String(length=50), nullable=False),
        sa.Column('official_clause', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'age_relaxation_rules',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('age_criteria_id', sa.String(length=36), nullable=False),
        sa.Column('community_category', sa.String(length=50), nullable=False),
        sa.Column('relaxation_years', sa.Integer(), nullable=False),
        sa.Column('max_age_relaxed', sa.Integer(), nullable=False),
        sa.Column('applicable_conditions', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['age_criteria_id'], ['age_criteria.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'community_domicile_rules',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('target_state', sa.String(length=100), nullable=True),
        sa.Column('requires_domicile', sa.Boolean(), nullable=False),
        sa.Column('allows_all_india_candidates', sa.Boolean(), nullable=False),
        sa.Column('reservation_quota_rules', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # 5. Recruitment Notifications, Posts, Versions, Sources
    op.create_table(
        'recruitment_notifications',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('advertisement_number', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('agency_name', sa.String(length=200), nullable=False),
        sa.Column('category_name', sa.String(length=100), nullable=False),
        sa.Column('release_date', sa.String(length=50), nullable=False),
        sa.Column('application_deadline', sa.String(length=50), nullable=False),
        sa.Column('tentative_exam_date', sa.String(length=50), nullable=True),
        sa.Column('total_vacancies', sa.Integer(), nullable=False),
        sa.Column('official_pdf_url', sa.String(length=500), nullable=True),
        sa.Column('official_portal', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('highlights', sa.JSON(), nullable=True),
        sa.Column('eligibility_snippet', sa.Text(), nullable=False),
        sa.Column('fee_structure', sa.String(length=255), nullable=False),
        sa.Column('is_verified_official', sa.Boolean(), nullable=False),
        sa.Column('verification_status', sa.String(length=50), nullable=False),
        sa.Column('verified_by', sa.String(length=100), nullable=True),
        sa.Column('source_portal_name', sa.String(length=200), nullable=False),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_recruitment_notifications_advt', 'recruitment_notifications', ['advertisement_number'], unique=True)

    op.create_table(
        'recruitment_posts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('notification_id', sa.String(length=36), nullable=False),
        sa.Column('post_title', sa.String(length=200), nullable=False),
        sa.Column('department', sa.String(length=200), nullable=True),
        sa.Column('pay_level', sa.String(length=50), nullable=False),
        sa.Column('vacancies_breakdown', sa.JSON(), nullable=True),
        sa.Column('total_post_vacancies', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['notification_id'], ['recruitment_notifications.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'notification_versions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('notification_id', sa.String(length=36), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('corrigendum_number', sa.String(length=100), nullable=True),
        sa.Column('change_summary', sa.Text(), nullable=False),
        sa.Column('diff_details', sa.JSON(), nullable=True),
        sa.Column('effective_date', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['notification_id'], ['recruitment_notifications.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'notification_sources',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('portal_name', sa.String(length=150), nullable=False),
        sa.Column('portal_url', sa.String(length=500), nullable=False),
        sa.Column('commission_type', sa.String(length=50), nullable=False),
        sa.Column('is_monitored', sa.Boolean(), nullable=False),
        sa.Column('last_crawled_at', sa.String(length=50), nullable=True),
        sa.Column('verification_level', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('portal_name'),
    )

    # 6. Student Profiles, Preferences, Saved Exams, Reminders, Study Plans
    op.create_table(
        'student_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('date_of_birth', sa.String(length=50), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('domicile_state', sa.String(length=100), nullable=False),
        sa.Column('is_pwd', sa.Boolean(), nullable=False),
        sa.Column('pwd_percentage', sa.Float(), nullable=True),
        sa.Column('education_level', sa.String(length=100), nullable=False),
        sa.Column('major_stream', sa.String(length=150), nullable=False),
        sa.Column('graduation_year', sa.Integer(), nullable=False),
        sa.Column('graduation_percentage', sa.Float(), nullable=False),
        sa.Column('preferred_daily_study_hours', sa.Integer(), nullable=False),
        sa.Column('is_onboarded', sa.Boolean(), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_student_profiles_email', 'student_profiles', ['email'], unique=True)

    op.create_table(
        'student_preferences',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('target_categories', sa.JSON(), nullable=True),
        sa.Column('target_exam_codes', sa.JSON(), nullable=True),
        sa.Column('email_notification_opt_in', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id'),
    )

    op.create_table(
        'saved_exams',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('exam_title', sa.String(length=255), nullable=False),
        sa.Column('conducting_body', sa.String(length=200), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('registration_number', sa.String(length=100), nullable=True),
        sa.Column('roll_number', sa.String(length=100), nullable=True),
        sa.Column('application_date', sa.String(length=50), nullable=True),
        sa.Column('exam_date', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id', 'exam_id', name='uq_student_saved_exam'),
    )

    op.create_table(
        'student_reminders',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('reminder_date', sa.String(length=50), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'study_plans',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('exam_id', sa.String(length=36), nullable=False),
        sa.Column('exam_title', sa.String(length=255), nullable=False),
        sa.Column('target_year', sa.Integer(), nullable=False),
        sa.Column('total_weeks', sa.Integer(), nullable=False),
        sa.Column('current_week', sa.Integer(), nullable=False),
        sa.Column('progress_percentage', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.ForeignKeyConstraint(['exam_id'], ['government_exams.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'daily_study_tasks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('study_plan_id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('subject', sa.String(length=150), nullable=False),
        sa.Column('topic', sa.String(length=255), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=False),
        sa.Column('scheduled_date', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['study_plan_id'], ['study_plans.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # 7. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('user_email', sa.String(length=255), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=100), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('changes_diff', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'], unique=False)
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'], unique=False)

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('daily_study_tasks')
    op.drop_table('study_plans')
    op.drop_table('student_reminders')
    op.drop_table('saved_exams')
    op.drop_table('student_preferences')
    op.drop_table('student_profiles')
    op.drop_table('notification_sources')
    op.drop_table('notification_versions')
    op.drop_table('recruitment_posts')
    op.drop_table('recruitment_notifications')
    op.drop_table('community_domicile_rules')
    op.drop_table('age_relaxation_rules')
    op.drop_table('age_criteria')
    op.drop_table('qualification_rules')
    op.drop_table('pay_scales')
    op.drop_table('syllabus_topics')
    op.drop_table('exam_stages')
    op.drop_table('government_exams')
    op.drop_table('exam_categories')
    op.drop_table('exam_authorities')
