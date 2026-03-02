"""add user streaks

Revision ID: 9b5e6dgg7421
Revises: 8a4d5cff6310
Create Date: 2026-03-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9b5e6dgg7421'
down_revision: Union[str, None] = '8a4d5cff6310'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('user_streaks',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('current_streak', sa.Integer(), nullable=False),
    sa.Column('longest_streak', sa.Integer(), nullable=False),
    sa.Column('last_active_date', sa.Date(), nullable=True),
    sa.Column('badges', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_streaks_user_id'), 'user_streaks', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_streaks_user_id'), table_name='user_streaks')
    op.drop_table('user_streaks')
