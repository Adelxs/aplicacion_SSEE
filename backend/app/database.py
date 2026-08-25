from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root@localhost:3306/ssee_db"
)

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg2://",
        1
    )


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()

if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            print("Conexión a MySQL exitosa :)")
    except Exception as e:
        print("Error de conexión:")
        print(e)
        
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()