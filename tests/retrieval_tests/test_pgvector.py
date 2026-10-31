
from sqlalchemy import text
from backend.database.connection import engine

try:
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT extversion FROM pg_extension WHERE extname = 'vector'")
        )

        version = result.scalar_one_or_none()

        if version:
            print("SUCCESS: pgvector is working!")
            print("pgvector version:", version)
        else:
            print("pgvector extension is not enabled.")

except Exception as error:
    print("Connection test failed:", error)
