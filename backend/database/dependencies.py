from typing import Generator
from sqlalchemy.orm import Session

from backend.database.connection import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Provide a database session for an API request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()