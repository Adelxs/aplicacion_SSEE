"""agregar frecuencia a lista de espera

Revision ID: fcf10a848cd4
Revises: 80b5e7271d80
Create Date: 2026-09-14 10:35:06.268918

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fcf10a848cd4'
down_revision: Union[str, Sequence[str], None] = '80b5e7271d80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'lista_espera',
        sa.Column(
            'frecuencia',
            sa.String(length=20),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        'lista_espera',
        'frecuencia'
    )