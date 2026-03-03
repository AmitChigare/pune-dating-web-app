"""add compatibility score and interests

Revision ID: 10c6f7hh8532
Revises: 9b5e6dgg7421
Create Date: 2026-03-03 19:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '10c6f7hh8532'
down_revision: Union[str, None] = '9b5e6dgg7421'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add compatibility_score to matches
    op.add_column('matches', sa.Column('compatibility_score', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_matches_compatibility_score'), 'matches', ['compatibility_score'], unique=False)
    
    # Add interests to profiles
    op.add_column('profiles', sa.Column('interests', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    # Drop interests from profiles
    op.drop_column('profiles', 'interests')
    
    # Drop compatibility_score from matches
    op.drop_index(op.f('ix_matches_compatibility_score'), table_name='matches')
    op.drop_column('matches', 'compatibility_score')
