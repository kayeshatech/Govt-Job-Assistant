"""Add official source monitoring, candidate review queue, and personalized alerts

Revision ID: 0002_monitoring_and_alerts
Revises: 0001_initial_schema
Create Date: 2026-10-26 19:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0002_monitoring_and_alerts'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Official Sources Registry
    op.create_table(
        'official_sources',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('authority_code', sa.String(length=50), nullable=False),
        sa.Column('authority_name', sa.String(length=200), nullable=False),
        sa.Column('official_domain', sa.String(length=200), nullable=False),
        sa.Column('listing_url', sa.String(length=500), nullable=False),
        sa.Column('source_type', sa.String(length=50), server_default='recruitment_listing', nullable=False),
        sa.Column('polling_frequency_minutes', sa.Integer(), server_default='60', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('fetch_method', sa.String(length=50), server_default='GET_HTML', nullable=False),
        sa.Column('source_config', sa.JSON(), nullable=True),
        sa.Column('terms_url', sa.String(length=500), nullable=True),
        sa.Column('rate_limit_delay_seconds', sa.Float(), server_default='2.0', nullable=False),
        sa.Column('last_crawled_at', sa.String(length=50), nullable=True),
        sa.Column('last_success_at', sa.String(length=50), nullable=True),
        sa.Column('last_failure_at', sa.String(length=50), nullable=True),
        sa.Column('last_error_message', sa.Text(), nullable=True),
        sa.Column('last_content_hash', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_official_sources_code', 'official_sources', ['authority_code'])
    op.create_index('ix_source_active_polling', 'official_sources', ['is_active', 'polling_frequency_minutes'])

    # 2. Candidate Changes & Review Items
    op.create_table(
        'extraction_review_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('source_id', sa.String(length=36), nullable=False),
        sa.Column('source_url', sa.String(length=500), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('document_title', sa.String(length=300), nullable=False),
        sa.Column('document_type', sa.String(length=50), server_default='PDF', nullable=False),
        sa.Column('raw_text_excerpt', sa.Text(), nullable=True),
        sa.Column('storage_path', sa.String(length=500), nullable=True),
        sa.Column('parser_version', sa.String(length=50), server_default='v3-hybrid', nullable=False),
        sa.Column('extracted_data', sa.JSON(), nullable=True),
        sa.Column('confidence_score', sa.Float(), server_default='0.95', nullable=False),
        sa.Column('change_type', sa.String(length=50), server_default='NEW_NOTICE', nullable=False),
        sa.Column('previous_notification_id', sa.String(length=36), nullable=True),
        sa.Column('diff_summary', sa.JSON(), nullable=True),
        sa.Column('high_impact_flags', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='PENDING_REVIEW', nullable=False),
        sa.Column('reviewed_by', sa.String(length=100), nullable=True),
        sa.Column('reviewed_at', sa.String(length=50), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('published_notification_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['source_id'], ['official_sources.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['previous_notification_id'], ['recruitment_notifications.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_candidate_status_impact', 'extraction_review_items', ['status', 'change_type'])
    op.create_index('ix_candidate_source_hash', 'extraction_review_items', ['source_id', 'content_hash'])

    # 3. Personalized Alerts
    op.create_table(
        'student_alerts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('reference_id', sa.String(length=100), nullable=True),
        sa.Column('reference_type', sa.String(length=50), server_default='exam', nullable=True),
        sa.Column('priority', sa.String(length=50), server_default='MEDIUM', nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('is_dismissed', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('email_dispatched', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('email_dispatched_at', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_student_alert_unread', 'student_alerts', ['student_id', 'is_read', 'is_dismissed'])
    op.create_index('ix_student_alert_type', 'student_alerts', ['student_id', 'alert_type'])

    # 4. Student Preferences new columns
    try:
        op.add_column('student_preferences', sa.Column('alert_new_exams', sa.Boolean(), server_default=sa.text('1'), nullable=False))
        op.add_column('student_preferences', sa.Column('alert_deadline_reminders', sa.Boolean(), server_default=sa.text('1'), nullable=False))
        op.add_column('student_preferences', sa.Column('alert_exam_updates', sa.Boolean(), server_default=sa.text('1'), nullable=False))
        op.add_column('student_preferences', sa.Column('alert_corrigendum', sa.Boolean(), server_default=sa.text('1'), nullable=False))
    except Exception:
        pass

def downgrade() -> None:
    op.drop_table('student_alerts')
    op.drop_table('extraction_review_items')
    op.drop_table('official_sources')
