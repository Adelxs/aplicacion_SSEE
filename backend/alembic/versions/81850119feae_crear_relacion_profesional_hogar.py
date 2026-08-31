
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


# ==========================================================
# FUNCIONES AUXILIARES
# ==========================================================

def tabla_existe(nombre_tabla: str) -> bool:

    bind = op.get_bind()

    resultado = bind.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = current_schema()
                AND table_name = :tabla
            )
            """
        ),
        {
            "tabla": nombre_tabla
        }
    )

    return resultado.scalar()


def columna_existe(
    nombre_tabla: str,
    nombre_columna: str
) -> bool:

    bind = op.get_bind()

    resultado = bind.execute(
        sa.text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                AND table_name = :tabla
                AND column_name = :columna
            )
            """
        ),
        {
            "tabla": nombre_tabla,
            "columna": nombre_columna
        }
    )

    return resultado.scalar()


def eliminar_fk_por_columna(
    tabla: str,
    columna: str
) -> None:

    bind = op.get_bind()

    # PostgreSQL
    if bind.dialect.name == "postgresql":

        resultado = bind.execute(
            sa.text(
                """
                SELECT
                    tc.constraint_name
                FROM information_schema.table_constraints tc
                INNER JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.table_schema = current_schema()
                AND tc.table_name = :tabla
                AND kcu.column_name = :columna
                AND tc.constraint_type = 'FOREIGN KEY'
                """
            ),
            {
                "tabla": tabla,
                "columna": columna
            }
        )

        constraints = [
            row[0]
            for row in resultado.fetchall()
        ]

        for constraint in constraints:

            op.drop_constraint(
                constraint,
                tabla,
                type_="foreignkey"
            )

    # MySQL
    else:

        resultado = bind.execute(
            sa.text(
                """
                SELECT
                    CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = :tabla
                AND COLUMN_NAME = :columna
                AND REFERENCED_TABLE_NAME IS NOT NULL
                """
            ),
            {
                "tabla": tabla,
                "columna": columna
            }
        )

        constraints = [
            row[0]
            for row in resultado.fetchall()
        ]

        for constraint in constraints:

            op.drop_constraint(
                constraint,
                tabla,
                type_="foreignkey"
            )


# ==========================================================
# UPGRADE
# ==========================================================

def upgrade() -> None:
    """Actualiza la relación entre profesionales y hogares."""

    # ==========================================================
    # 1. CREAR TABLA PROFESIONAL_HOGAR
    # ==========================================================

    if not tabla_existe("profesional_hogar"):

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
    # 2. MIGRAR VÍNCULOS EXISTENTES
    # ==========================================================

    # Solo hacemos la migración si hogares todavía posee
    # la antigua columna profesional_id.

    if columna_existe(
        "hogares",
        "profesional_id"
    ):

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
            AND NOT EXISTS (
                SELECT 1
                FROM profesional_hogar ph
                WHERE ph.profesional_id = hogares.profesional_id
                AND ph.hogar_id = hogares.id
            )
            """
        )


    # ==========================================================
    # 3. ELIMINAR FK ANTIGUA DE HOGARES
    # ==========================================================

    if columna_existe(
        "hogares",
        "profesional_id"
    ):

        eliminar_fk_por_columna(
            "hogares",
            "profesional_id"
        )

        op.drop_column(
            "hogares",
            "profesional_id"
        )


    # ==========================================================
    # 4. LISTA DE ESPERA
    # ==========================================================

    # La migración anterior utilizaba hogar_id.
    # El modelo actual utiliza id_hogar.

    if columna_existe(
        "lista_espera",
        "hogar_id"
    ):

        # No dependemos del nombre de la FK.
        eliminar_fk_por_columna(
            "lista_espera",
            "hogar_id"
        )

        op.drop_column(
            "lista_espera",
            "hogar_id"
        )


    # ==========================================================
    # 5. ELIMINAR PROFESIONAL_NOMBRE
    # ==========================================================

    if columna_existe(
        "lista_espera",
        "profesional_nombre"
    ):

        op.drop_column(
            "lista_espera",
            "profesional_nombre"
        )


    # ==========================================================
    # 6. RESTRICCIÓN ÚNICA EN USUARIOS
    # ==========================================================

    bind = op.get_bind()

    if bind.dialect.name == "postgresql":

        resultado = bind.execute(
            sa.text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = current_schema()
                    AND table_name = 'usuarios'
                    AND constraint_name = 'uq_usuarios_profesional_id'
                )
                """
            )
        )

        existe_constraint = resultado.scalar()

    else:

        resultado = bind.execute(
            sa.text(
                """
                SELECT COUNT(*)
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                AND table_name = 'usuarios'
                AND constraint_name = 'uq_usuarios_profesional_id'
                """
            )
        )

        existe_constraint = resultado.scalar() > 0


    if not existe_constraint:

        op.create_unique_constraint(
            "uq_usuarios_profesional_id",
            "usuarios",
            ["profesional_id"]
        )


# ==========================================================
# DOWNGRADE
# ==========================================================

def downgrade() -> None:
    """Revierte la migración."""

    # ==========================================================
    # 1. USUARIOS
    # ==========================================================

    bind = op.get_bind()

    if bind.dialect.name == "postgresql":

        resultado = bind.execute(
            sa.text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = current_schema()
                    AND table_name = 'usuarios'
                    AND constraint_name = 'uq_usuarios_profesional_id'
                )
                """
            )
        )

        existe_constraint = resultado.scalar()

    else:

        resultado = bind.execute(
            sa.text(
                """
                SELECT COUNT(*)
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                AND table_name = 'usuarios'
                AND constraint_name = 'uq_usuarios_profesional_id'
                """
            )
        )

        existe_constraint = resultado.scalar() > 0


    if existe_constraint:

        op.drop_constraint(
            "uq_usuarios_profesional_id",
            "usuarios",
            type_="unique"
        )


    # ==========================================================
    # 2. LISTA DE ESPERA
    # ==========================================================

    if not columna_existe(
        "lista_espera",
        "hogar_id"
    ):

        op.add_column(
            "lista_espera",
            sa.Column(
                "hogar_id",
                sa.Integer(),
                nullable=True
            )
        )


    eliminar_fk_por_columna(
        "lista_espera",
        "hogar_id"
    )

    op.create_foreign_key(
        "lista_espera_ibfk_1",
        "lista_espera",
        "hogares",
        ["hogar_id"],
        ["id"]
    )


    if not columna_existe(
        "lista_espera",
        "profesional_nombre"
    ):

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

    if not columna_existe(
        "hogares",
        "profesional_id"
    ):

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

    if tabla_existe("profesional_hogar"):

        op.execute(
            """
            UPDATE hogares h
            SET profesional_id = ph.profesional_id
            FROM profesional_hogar ph
            WHERE ph.hogar_id = h.id
            """
        )


    # ==========================================================
    # 5. ELIMINAR TABLA PROFESIONAL_HOGAR
    # ==========================================================

    if tabla_existe("profesional_hogar"):

        op.drop_table(
            "profesional_hogar"
        )

