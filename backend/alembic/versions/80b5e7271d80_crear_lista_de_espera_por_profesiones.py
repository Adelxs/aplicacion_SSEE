"""crear lista de espera por profesiones

Revision ID: 80b5e7271d80
Revises: 81850119feae
Create Date: 2026-09-09 12:27:35.775156

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "80b5e7271d80"

down_revision: Union[str, Sequence[str], None] = "81850119feae"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "profesiones_lista_espera",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "nombre",
            sa.String(length=100),
            nullable=False
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint(
            "nombre"
        )
    )

    op.create_table(
        "hogares_profesiones_lista_espera",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "hogar_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "profesion_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "fecha_ingreso",
            sa.Date(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["hogar_id"],
            ["hogares.id"]
        ),

        sa.ForeignKeyConstraint(
            ["profesion_id"],
            ["profesiones_lista_espera.id"]
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint(
            "hogar_id",
            "profesion_id",
            name="uq_hogar_profesion_lista_espera"
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_table(
        "hogares_profesiones_lista_espera"
    )

    op.drop_table(
        "profesiones_lista_espera"
    )