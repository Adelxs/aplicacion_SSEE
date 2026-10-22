"""agregar activo a lista espera

Revision ID: e631e671f398
Revises: fcf10a848cd4
Create Date: 2026-10-05 16:00:08.917474

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'e631e671f398'
down_revision: Union[str, Sequence[str], None] = 'fcf10a848cd4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "lista_espera",
        sa.Column(
            "activo",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "lista_espera",
        "activo"
    )
