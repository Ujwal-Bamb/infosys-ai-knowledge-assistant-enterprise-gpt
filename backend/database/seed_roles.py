from sqlalchemy import select

from backend.database.connection import SessionLocal
from backend.database.models import Role

DEFAULT_ROLES = ["Admin", "Employee", "Employer"]


def seed_roles() -> None:
    """Seed default user roles into the database if they do not exist."""
    with SessionLocal() as session:
        try:
            for role_name in DEFAULT_ROLES:
                existing_role = session.execute(
                    select(Role).where(Role.name == role_name)
                ).scalar_one_or_none()

                if existing_role is None:
                    session.add(Role(name=role_name))
                    print(f"Created role: {role_name}")
                else:
                    print(f"Role already exists: {role_name}")

            session.commit()
            print("Role initialization completed!")
        except Exception as exc:
            session.rollback()
            print(f"Failed to seed roles: {exc}")
            raise


if __name__ == "__main__":
    seed_roles()