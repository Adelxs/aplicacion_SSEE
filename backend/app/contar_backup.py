import re

ARCHIVO_BACKUP = "backup_20260915_152632.sql"

tablas = [
    "hogares",
    "intervenciones",
    "lista_espera",
    "profesional_hogar",
    "profesionales",
    "profesiones_lista_espera",
    "hogares_profesiones_lista_espera",
    "usuarios",
]

with open(ARCHIVO_BACKUP, "r", encoding="utf-8") as archivo:
    contenido = archivo.read()

print("\n=== REGISTROS DEL BACKUP ===\n")

for tabla in tablas:
    patron = rf"COPY public\.{re.escape(tabla)} .*? FROM stdin;\n(.*?)\\\."
    coincidencia = re.search(patron, contenido, re.DOTALL)

    if not coincidencia:
        print(f"{tabla}: NO ENCONTRADA")
        continue

    datos = coincidencia.group(1).strip()

    if not datos:
        cantidad = 0
    else:
        cantidad = len(datos.splitlines())

    print(f"{tabla}: {cantidad}")

print("\n=== FIN ===")