"""Add Part 5 community study groups, discussion messages, and mentor profiles

Revision ID: 0004_part5_community_and_security
Revises: 0003_part4_rag_and_prep
Create Date: 2026-10-27 10:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0004_part5_community_and_security'
down_revision: Union[str, None] = '0003_part4_rag_and_prep'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Study Groups (Feature 88)
    op.create_table(
        'study_groups',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('exam_code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), server_default='General Studies', nullable=False),
        sa.Column('member_count', sa.Integer(), server_default='1', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('created_by', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_study_groups_exam_code', 'study_groups', ['exam_code'])

    # 2. Group Discussion Messages (Feature 88 & 89)
    op.create_table(
        'group_discussion_messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('group_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('author_name', sa.String(length=150), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_verified_mentor_answer', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('likes_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['study_groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_group_discussion_messages_group_id', 'group_discussion_messages', ['group_id'])
    op.create_index('ix_group_discussion_messages_user_id', 'group_discussion_messages', ['user_id'])
    op.create_index('ix_group_discussion_messages_created_at', 'group_discussion_messages', ['created_at'])

    # 3. Mentor Profiles (Feature 89)
    op.create_table(
        'mentor_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('designation', sa.String(length=150), nullable=False),
        sa.Column('specialization', sa.String(length=200), nullable=False),
        sa.Column('institution', sa.String(length=200), nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('total_answers_resolved', sa.Integer(), server_default='0', nullable=False),
        sa.Column('rating', sa.Float(), server_default='4.9', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_mentor_profiles_user_id', 'mentor_profiles', ['user_id'])


def downgrade() -> None:
    op.drop_table('mentor_profiles')
    op.drop_table('group_discussion_messages')
    op.drop_table('study_groups')
