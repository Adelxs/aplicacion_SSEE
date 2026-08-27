"""agregar profesional_id a lista espera

Revision ID: 8c06f1687dc8
Revises: 34b1d6722387
Create Date: 2026-08-27 12:10:52.172977
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c06f1687dc8'

down_revision: Union[str, Sequence[str], None] = '34b1d6722387'

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        'lista_espera',
        sa.Column(
            'profesional_id',
            sa.Integer(),
            nullable=True
        )
    )

    op.create_foreign_key(
        'fk_lista_espera_profesional',
        'lista_espera',
        'profesionales',
        ['profesional_id'],
        ['id']
    )


def downgrade() -> None:

    op.drop_constraint(
        'fk_lista_espera_profesional',
        'lista_espera',
        type_='foreignkey'
    )

    op.drop_column(
        'lista_espera',
        'profesional_id'
    )