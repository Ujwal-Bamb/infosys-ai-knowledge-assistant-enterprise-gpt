from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.api.main import app
from backend.database.dependencies import get_db
from backend.database.models import Base, Role

# Isolated in-memory SQLite database for deterministic security testing
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

# Seed initial roles
with TestingSessionLocal() as session:
    if not session.query(Role).filter(Role.name == "Admin").first():
        session.add(Role(id=1, name="Admin"))
    if not session.query(Role).filter(Role.name == "Employee").first():
        session.add(Role(id=2, name="Employee"))
    session.commit()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)
