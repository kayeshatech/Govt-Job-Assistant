"""Add Part 4 RAG knowledge base, question banks, mock tests, mistake notebook, productivity, and agent audits

Revision ID: 0003_part4_rag_and_prep
Revises: 0002_monitoring_and_alerts
Create Date: 2026-10-26 22:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0003_part4_rag_and_prep'
down_revision: Union[str, None] = '0002_monitoring_and_alerts'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Document Knowledge Bases (RAG)
    op.create_table(
        'document_knowledge_bases',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('doc_type', sa.String(length=64), nullable=False),
        sa.Column('authority_code', sa.String(length=32), nullable=True),
        sa.Column('exam_code', sa.String(length=64), nullable=True),
        sa.Column('version_label', sa.String(length=64), server_default='1.0', nullable=False),
        sa.Column('file_url', sa.String(length=512), nullable=True),
        sa.Column('storage_path', sa.String(length=512), nullable=True),
        sa.Column('total_pages', sa.Integer(), server_default='1', nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('is_verified_source', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('source_reference', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('content_hash')
    )
    op.create_index('ix_doc_kb_title', 'document_knowledge_bases', ['title'])
    op.create_index('ix_doc_kb_exam_code', 'document_knowledge_bases', ['exam_code'])

    # 2. Document Chunks (RAG)
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('document_id', sa.String(length=36), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('page_number', sa.Integer(), server_default='1', nullable=False),
        sa.Column('section_heading', sa.String(length=255), nullable=True),
        sa.Column('token_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('chunk_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['document_knowledge_bases.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_doc_chunks_doc_id', 'document_chunks', ['document_id'])

    # 3. Question Bank
    op.create_table(
        'question_banks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('exam_code', sa.String(length=64), nullable=False),
        sa.Column('paper_type', sa.String(length=32), server_default='PAPER_1', nullable=False),
        sa.Column('subject', sa.String(length=128), nullable=False),
        sa.Column('topic', sa.String(length=128), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False),
        sa.Column('correct_option_index', sa.Integer(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('difficulty', sa.String(length=16), server_default='MEDIUM', nullable=False),
        sa.Column('question_source', sa.String(length=32), server_default='OFFICIAL_PYQ', nullable=False),
        sa.Column('pyq_year', sa.Integer(), nullable=True),
        sa.Column('source_citation', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_question_banks_exam', 'question_banks', ['exam_code'])
    op.create_index('ix_question_banks_subject', 'question_banks', ['subject'])
    op.create_index('ix_question_banks_topic', 'question_banks', ['topic'])

    # 4. Mock Tests
    op.create_table(
        'mock_tests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('exam_code', sa.String(length=64), nullable=False),
        sa.Column('test_type', sa.String(length=32), server_default='FULL_LENGTH', nullable=False),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('positive_marks_per_q', sa.Float(), server_default='2.0', nullable=False),
        sa.Column('negative_marks_per_q', sa.Float(), server_default='0.66', nullable=False),
        sa.Column('question_ids', sa.JSON(), nullable=False),
        sa.Column('instructions', sa.Text(), nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_mock_tests_exam', 'mock_tests', ['exam_code'])

    # 5. Mock Test Attempts
    op.create_table(
        'mock_test_attempts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('mock_test_id', sa.String(length=36), nullable=False),
        sa.Column('exam_code', sa.String(length=64), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('time_spent_seconds', sa.Integer(), server_default='0', nullable=False),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('total_attempted', sa.Integer(), server_default='0', nullable=False),
        sa.Column('correct_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('incorrect_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('unanswered_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('score', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('total_marks', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('accuracy_percentage', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('percentile_rank', sa.Float(), nullable=True),
        sa.Column('weak_topics', sa.JSON(), nullable=False),
        sa.Column('strong_topics', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mock_test_id'], ['mock_tests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_attempts_student_id', 'mock_test_attempts', ['student_id'])

    # 6. Student Mistakes
    op.create_table(
        'student_mistakes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('question_id', sa.String(length=36), nullable=False),
        sa.Column('attempt_id', sa.String(length=36), nullable=True),
        sa.Column('chosen_option_index', sa.Integer(), nullable=False),
        sa.Column('correct_option_index', sa.Integer(), nullable=False),
        sa.Column('topic', sa.String(length=128), nullable=False),
        sa.Column('subject', sa.String(length=128), nullable=False),
        sa.Column('review_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_resolved', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['question_banks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['attempt_id'], ['mock_test_attempts.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_mistakes_student_id', 'student_mistakes', ['student_id'])
    op.create_index('ix_mistakes_topic', 'student_mistakes', ['topic'])

    # 7. Student Study Goals
    op.create_table(
        'student_study_goals',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('target_date', sa.Date(), nullable=False),
        sa.Column('goal_hours', sa.Float(), server_default='6.0', nullable=False),
        sa.Column('completed_hours', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('is_completed', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_goals_student_target', 'student_study_goals', ['student_id', 'target_date'])

    # 8. Pomodoro Sessions
    op.create_table(
        'pomodoro_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), server_default='25', nullable=False),
        sa.Column('topic', sa.String(length=128), server_default='General Study', nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_pomodoro_student_id', 'pomodoro_sessions', ['student_id'])

    # 9. Study Streaks
    op.create_table(
        'study_streaks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('current_streak_days', sa.Integer(), server_default='1', nullable=False),
        sa.Column('longest_streak_days', sa.Integer(), server_default='1', nullable=False),
        sa.Column('last_active_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id')
    )

    # 10. Agent Execution Audits
    op.create_table(
        'agent_execution_audits',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=True),
        sa.Column('session_id', sa.String(length=64), nullable=False),
        sa.Column('agent_name', sa.String(length=64), nullable=False),
        sa.Column('input_summary', sa.Text(), nullable=False),
        sa.Column('output_summary', sa.Text(), nullable=False),
        sa.Column('tokens_used', sa.Integer(), server_default='0', nullable=False),
        sa.Column('execution_time_ms', sa.Integer(), server_default='0', nullable=False),
        sa.Column('supporting_sources', sa.JSON(), nullable=False),
        sa.Column('step_number', sa.Integer(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_agent_audits_session', 'agent_execution_audits', ['session_id'])


def downgrade() -> None:
    op.drop_table('agent_execution_audits')
    op.drop_table('study_streaks')
    op.drop_table('pomodoro_sessions')
    op.drop_table('student_study_goals')
    op.drop_table('student_mistakes')
    op.drop_table('mock_test_attempts')
    op.drop_table('mock_tests')
    op.drop_table('question_banks')
    op.drop_table('document_chunks')
    op.drop_table('document_knowledge_bases')
