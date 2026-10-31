from backend.database.connection import SessionLocal
from backend.database.models import User
from backend.auth.security import hash_password, verify_password

db = SessionLocal()

try:
    user = db.query(User).filter(
        User.email == "demo2@example.com"
    ).first()

    if user:
        print("Stored hash starts with:", user.hashed_password[:7])
        print("Stored hash length:", len(user.hashed_password))

        new_hash = hash_password("DemoPass123")

        print("New hash starts with:", new_hash[:7])
        print("New hash length:", len(new_hash))

        print(
            "New hash verification:",
            verify_password("DemoPass123", new_hash)
        )

        print(
            "Stored hash verification:",
            verify_password("DemoPass123", user.hashed_password)
        )

finally:
    db.close()