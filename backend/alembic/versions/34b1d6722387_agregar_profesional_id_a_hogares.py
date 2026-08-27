"""agregar profesional_id a hogares

Revision ID: 34b1d6722387
Revises: fa56d0e4667c
Create Date: 2026-08-27 10:11:19.515123

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '34b1d6722387'
down_revision: Union[str, Sequence[str], None] = 'fa56d0e4667c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'hogares',
        sa.Column(
            'profesional_id',
            sa.Integer(),
            nullable=True
        )
    )

    op.create_foreign_key(
        'fk_hogares_profesional',
        'hogares',
        'profesionales',
        ['profesional_id'],
        ['id']
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        'fk_hogares_profesional',
        'hogares',
        type_='foreignkey'
    )

    op.drop_column(
        'hogares',
        'profesional_id'
    )