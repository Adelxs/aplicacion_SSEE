
"""
crear relacion profesional hogar

Revision ID: 81850119feae
Revises: 8c06f1687dc8
Create Date: 2026-08-31 11:41:51.263716
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "81850119feae"
down_revision: Union[str, Sequence[str], None] = "8c06f1687dc8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Actualiza la relación entre profesionales y hogares."""

    # ==========================================================
    # 1. CREAR TABLA PROFESIONAL_HOGAR
    # ==========================================================

    op.create_table(
        "profesional_hogar",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True
        ),

        sa.Column(
            "profesional_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "hogar_id",
            sa.Integer(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["profesional_id"],
            ["profesionales.id"],
            name="fk_profesional_hogar_profesional"
        ),

        sa.ForeignKeyConstraint(
            ["hogar_id"],
            ["hogares.id"],
            name="fk_profesional_hogar_hogar"
        ),

        sa.UniqueConstraint(
            "profesional_id",
            "hogar_id",
            name="uq_profesional_hogar"
        )
    )


    # ==========================================================
    # 2. MIGRAR LOS VÍNCULOS EXISTENTES
    # ==========================================================

    # Antes:
    #
    # hogares.profesional_id
    #
    # Ahora:
    #
    # profesional_hogar.profesional_id
    # profesional_hogar.hogar_id
    #
    # Copiamos los vínculos existentes para no perderlos.

    op.execute(
        """
        INSERT INTO profesional_hogar (
            profesional_id,
            hogar_id
        )
        SELECT
            profesional_id,
            id
        FROM hogares
        WHERE profesional_id IS NOT NULL
        """
    )


    # ==========================================================
    # 3. ELIMINAR LA ANTIGUA RELACIÓN DE HOGARES
    # ==========================================================

    op.drop_constraint(
        "fk_hogares_profesional",
        "hogares",
        type_="foreignkey"
    )

    op.drop_column(
        "hogares",
        "profesional_id"
    )


    # ==========================================================
    # 4. LISTA DE ESPERA
    # ==========================================================

    # El modelo actual utiliza id_hogar
    # en lugar de hogar_id.

    op.drop_constraint(
        "lista_espera_ibfk_1",
        "lista_espera",
        type_="foreignkey"
    )

    op.drop_column(
        "lista_espera",
        "hogar_id"
    )


    # profesional_nombre también fue reemplazado
    # por profesional_id.

    op.drop_column(
        "lista_espera",
        "profesional_nombre"
    )


    # ==========================================================
    # 5. USUARIOS
    # ==========================================================

    # Un profesional solamente puede estar asociado
    # a un usuario.

    op.create_unique_constraint(
        "uq_usuarios_profesional_id",
        "usuarios",
        ["profesional_id"]
    )


def downgrade() -> None:
    """Revierte la migración."""

    # ==========================================================
    # 1. USUARIOS
    # ==========================================================

    op.drop_constraint(
        "uq_usuarios_profesional_id",
        "usuarios",
        type_="unique"
    )


    # ==========================================================
    # 2. LISTA DE ESPERA
    # ==========================================================

    op.add_column(
        "lista_espera",
        sa.Column(
            "hogar_id",
            sa.Integer(),
            nullable=True
        )
    )

    op.create_foreign_key(
        "lista_espera_ibfk_1",
        "lista_espera",
        "hogares",
        ["hogar_id"],
        ["id"]
    )

    op.add_column(
        "lista_espera",
        sa.Column(
            "profesional_nombre",
            sa.String(150),
            nullable=True
        )
    )


    # ==========================================================
    # 3. HOGARES
    # ==========================================================

    op.add_column(
        "hogares",
        sa.Column(
            "profesional_id",
            sa.Integer(),
            nullable=True
        )
    )

    op.create_foreign_key(
        "fk_hogares_profesional",
        "hogares",
        "profesionales",
        ["profesional_id"],
        ["id"]
    )


    # ==========================================================
    # 4. RESTAURAR VÍNCULOS
    # ==========================================================

    op.execute(
        """
        UPDATE hogares h
        INNER JOIN profesional_hogar ph
            ON ph.hogar_id = h.id
        SET h.profesional_id = ph.profesional_id
        """
    )


    # ==========================================================
    # 5. ELIMINAR TABLA PROFESIONAL_HOGAR
    # ==========================================================

    op.drop_table(
        "profesional_hogar"
    )

