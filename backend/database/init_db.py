from sqlalchemy import text

from backend.database import models  # noqa: F401 - Registers models with Base
from backend.database.connection import Base, engine


def initialize_database() -> None:
    """Enable pgvector extension and create all database tables."""
    print("Initializing database...")

    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

    Base.metadata.create_all(bind=engine)

    print("Database tables created successfully!")
    print("Registered Tables:")
    for table_name in Base.metadata.tables.keys():
        print(f" - {table_name}")


if __name__ == "__main__":
    initialize_database()