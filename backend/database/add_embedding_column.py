from sqlalchemy import text

from backend.database.connection import engine
from backend.database.models import EMBEDDING_DIM


def add_embedding_column() -> None:
    """Ensure pgvector extension and embedding column exist on document_chunks."""
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        connection.execute(
            text(
                f"ALTER TABLE document_chunks "
                f"ADD COLUMN IF NOT EXISTS embedding vector({EMBEDDING_DIM});"
            )
        )

    print(f"Embedding column (vector({EMBEDDING_DIM})) verified/added successfully.")


if __name__ == "__main__":
    add_embedding_column()