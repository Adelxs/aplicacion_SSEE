from pathlib import Path
import re


# ============================================================
# CONFIGURACIÓN
# ============================================================

ARCHIVO_ENTRADA = Path("backup_20260907_131837.sql")
ARCHIVO_SALIDA = Path("migracion_mysql.sql")


# ============================================================
# CONVERSIÓN DE TIPOS
# ============================================================

def convertir_tipo(tipo):
    tipo = tipo.strip()

    # VARCHAR(n)
    match = re.match(r"character varying\((\d+)\)", tipo)

    if match:
        return f"VARCHAR({match.group(1)})"

    tipos = {
        "integer": "INT",
        "text": "TEXT",
        "boolean": "BOOLEAN",
        "date": "DATE",
    }

    return tipos.get(tipo, tipo)


# ============================================================
# ESCAPAR VALORES PARA MYSQL
# ============================================================

def escapar_mysql(valor):
    """
    Convierte un valor proveniente de PostgreSQL
    a un valor seguro para un INSERT de MySQL.
    """

    # PostgreSQL utiliza \N para representar NULL
    if valor == r"\N":
        return "NULL"

    # Booleanos PostgreSQL
    if valor == "t":
        return "TRUE"

    if valor == "f":
        return "FALSE"

    # Escapar caracteres especiales
    valor = valor.replace("\\", "\\\\")
    valor = valor.replace("'", "''")
    valor = valor.replace("\r", "\\r")
    valor = valor.replace("\n", "\\n")

    return f"'{valor}'"


# ============================================================
# PROCESAR DATOS COPY
# ============================================================

def procesar_copy(nombre_tabla, columnas, filas, salida):
    """
    Convierte un bloque COPY de PostgreSQL
    en múltiples INSERT de MySQL.
    """

    contador = 0

    columnas_sql = ", ".join(
        f"`{columna}`"
        for columna in columnas
    )

    for fila in filas:

        # Separación de columnas del formato COPY
        valores = fila.split("\t")

        valores_sql = ", ".join(
            escapar_mysql(valor)
            for valor in valores
        )

        salida.write(
            f"INSERT INTO `{nombre_tabla}` "
            f"({columnas_sql}) "
            f"VALUES ({valores_sql});\n"
        )

        contador += 1

    salida.write("\n")

    print(
        f"Tabla {nombre_tabla}: "
        f"{contador} registros"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    if not ARCHIVO_ENTRADA.exists():
        print(
            f"ERROR: No se encontró "
            f"{ARCHIVO_ENTRADA}"
        )
        return

    print("Leyendo backup PostgreSQL...")
    print()

    contenido = ARCHIVO_ENTRADA.read_text(
        encoding="utf-8",
        errors="replace"
    )

    # --------------------------------------------------------
    # EXTRAER TABLAS
    # --------------------------------------------------------

    bloques_create = re.findall(
        r"CREATE TABLE public\.(\w+) \((.*?)\n\);",
        contenido,
        re.DOTALL
    )

    # --------------------------------------------------------
    # CREAR ARCHIVO MYSQL
    # --------------------------------------------------------

    with ARCHIVO_SALIDA.open(
        "w",
        encoding="utf-8"
    ) as salida:

        salida.write(
            "-- =============================================\n"
        )
        salida.write(
            "-- MIGRACIÓN PostgreSQL -> MySQL\n"
        )
        salida.write(
            "-- =============================================\n\n"
        )

        salida.write(
            "CREATE DATABASE IF NOT EXISTS "
            "`ssee_prueba`;\n"
        )

        salida.write(
            "USE `ssee_prueba`;\n\n"
        )

        salida.write(
            "SET FOREIGN_KEY_CHECKS = 0;\n\n"
        )

        # ----------------------------------------------------
        # CREAR TABLAS
        # ----------------------------------------------------

        for nombre_tabla, contenido_tabla in bloques_create:

            # Alembic no es necesario para la aplicación MySQL
            if nombre_tabla == "alembic_version":
                continue

            salida.write(
                f"DROP TABLE IF EXISTS `{nombre_tabla}`;\n"
            )

        salida.write("\n")

        for nombre_tabla, contenido_tabla in bloques_create:

            if nombre_tabla == "alembic_version":
                continue

            salida.write(
                f"CREATE TABLE `{nombre_tabla}` (\n"
            )

            columnas = []

            for linea in contenido_tabla.splitlines():

                linea = linea.strip()

                if not linea:
                    continue

                match = re.match(
                    r"(\w+)\s+(.+?)(?:,)?$",
                    linea
                )

                if not match:
                    continue

                nombre_columna = match.group(1)
                definicion = match.group(2)

                # Detectar NOT NULL
                not_null = (
                    " NOT NULL"
                    if "NOT NULL" in definicion
                    else ""
                )

                # Eliminar NOT NULL
                definicion = re.sub(
                    r"\s+NOT NULL",
                    "",
                    definicion
                )

                # Eliminar DEFAULT PostgreSQL
                definicion = re.sub(
                    r"\s+DEFAULT\s+.*",
                    "",
                    definicion
                )

                definicion = definicion.strip()

                tipo = convertir_tipo(definicion)

                # ID principal autoincremental
                if (
                    nombre_columna == "id"
                    and tipo == "INT"
                ):
                    linea_mysql = (
                        f"    `{nombre_columna}` "
                        f"INT AUTO_INCREMENT PRIMARY KEY"
                    )

                else:
                    linea_mysql = (
                        f"    `{nombre_columna}` "
                        f"{tipo}{not_null}"
                    )

                columnas.append(linea_mysql)

            salida.write(
                ",\n".join(columnas)
            )

            salida.write("\n);\n\n")

        # ----------------------------------------------------
        # INSERTAR DATOS
        # ----------------------------------------------------

        salida.write(
            "-- =============================================\n"
        )
        salida.write(
            "-- DATOS\n"
        )
        salida.write(
            "-- =============================================\n\n"
        )

        # Buscar bloques COPY
        patron_copy = re.compile(
            r"COPY public\.(\w+) "
            r"\((.*?)\) FROM stdin;\n"
            r"(.*?)"
            r"\\\.",
            re.DOTALL
        )

        total_tablas = 0

        for match in patron_copy.finditer(contenido):

            nombre_tabla = match.group(1)

            columnas = [
                columna.strip()
                for columna in match.group(2).split(",")
            ]

            datos = match.group(3)

            filas = [
                fila
                for fila in datos.splitlines()
                if fila.strip()
            ]

            # No importar alembic_version
            if nombre_tabla == "alembic_version":
                continue

            procesar_copy(
                nombre_tabla,
                columnas,
                filas,
                salida
            )

            total_tablas += 1

        # ----------------------------------------------------
        # FOREIGN KEYS
        # ----------------------------------------------------

        salida.write(
            "-- =============================================\n"
        )
        salida.write(
            "-- CLAVES FORÁNEAS\n"
        )
        salida.write(
            "-- =============================================\n\n"
        )

        foreign_keys = re.findall(
            r"ALTER TABLE ONLY public\.(\w+)\s+"
            r"ADD CONSTRAINT (\w+)\s+"
            r"FOREIGN KEY \((\w+)\)\s+"
            r"REFERENCES public\.(\w+)\((\w+)\);",
            contenido,
            re.DOTALL
        )

        for (
            tabla_origen,
            constraint,
            columna,
            tabla_referencia,
            columna_referencia
        ) in foreign_keys:

            salida.write(
                f"ALTER TABLE `{tabla_origen}` "
                f"ADD CONSTRAINT `{constraint}` "
                f"FOREIGN KEY (`{columna}`) "
                f"REFERENCES `{tabla_referencia}` "
                f"(`{columna_referencia}`);\n"
            )
        salida.write("\n")

        salida.write(
            "SET FOREIGN_KEY_CHECKS = 1;\n"
        )

    print()
    print("=============================================")
    print("Migración generada correctamente.")
    print("=============================================")
    print(
        f"Tablas procesadas: {total_tablas}"
    )
    print(
        f"Archivo generado: {ARCHIVO_SALIDA}"
    )


if __name__ == "__main__":
    main()