"""
Secure Admin Provisioning Script for Infosys AI Knowledge Assistant.

This script provisions a designated Administrator account directly into PostgreSQL.
It is an administrative tool only and is intentionally NOT exposed through any API route.

Security guarantees:
1. Prompts for password interactively using getpass (hidden terminal input).
2. Never accepts passwords via CLI arguments or environment flags.
3. Validates password length and confirms password match.
4. Normalizes email (lowercase, stripped) and rejects duplicate accounts.
5. Verifies that the 'Admin' role exists in the database.
6. Hashes passwords using bcrypt via passlib (identical to runtime authentication).
7. Never prints or logs plain passwords.

Usage:
    cd /path/to/INFOSYS-AI-Knowledge-Assistant-Enterprise-GPT
    python -m backend.database.seed_admin
"""

import getpass
import re
import sys
from sqlalchemy.orm import Session

from backend.auth.security import hash_password
from backend.database.connection import SessionLocal
from backend.database.models import Role, User

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")


def validate_email_format(email: str) -> str:
    """Validate and normalize email string."""
    normalized = email.strip().lower()
    if not normalized:
        raise ValueError("Email cannot be empty.")
    if not EMAIL_REGEX.match(normalized):
        raise ValueError(f"'{email}' is not a valid email address.")
    return normalized


def provision_admin(
    full_name: str,
    email: str,
    password: str,
    db: Session,
) -> User:
    """
    Provision a new Admin user account into the database.

    Raises ValueError if:
    - Admin role does not exist
    - Email is invalid or already registered
    - Password is shorter than 8 characters or exceeds 72 bytes
    """
    clean_name = full_name.strip()
    if len(clean_name) < 2:
        raise ValueError("Admin full name must be at least 2 characters long.")

    normalized_email = validate_email_format(email)

    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes.")

    # 1. Verify Admin role exists
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if not admin_role:
        raise ValueError(
            "The 'Admin' role does not exist in the database. "
            "Please initialize roles first using: python -m backend.database.seed_roles"
        )

    # 2. Check for duplicate user
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise ValueError(
            f"User with email '{normalized_email}' already exists. "
            "Existing accounts cannot be overwritten or silently modified."
        )

    # 3. Create Admin account with secure bcrypt hash
    admin_user = User(
        full_name=clean_name,
        email=normalized_email,
        hashed_password=hash_password(password),
        role_id=admin_role.id,
        is_active=True,
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    return admin_user


def interactive_seed() -> None:
    """Run interactive CLI prompt to securely provision an Admin user."""
    print("=" * 60)
    print("  Infosys AI Knowledge Assistant - Secure Admin Provisioning")
    print("=" * 60)

    try:
        full_name = input("Enter Admin Full Name: ").strip()
        if not full_name:
            print("❌ Error: Full name is required.")
            sys.exit(1)

        raw_email = input("Enter Admin Corporate Email: ").strip()
        try:
            email = validate_email_format(raw_email)
        except ValueError as err:
            print(f"❌ Error: {err}")
            sys.exit(1)

        password = getpass.getpass("Enter Admin Password (hidden): ")
        if len(password) < 8:
            print("❌ Error: Password must be at least 8 characters long.")
            sys.exit(1)
        if len(password.encode("utf-8")) > 72:
            print("❌ Error: Password must not exceed 72 bytes.")
            sys.exit(1)

        confirm_password = getpass.getpass("Confirm Admin Password (hidden): ")
        if password != confirm_password:
            print("❌ Error: Passwords do not match.")
            sys.exit(1)

        with SessionLocal() as session:
            admin_user = provision_admin(
                full_name=full_name,
                email=email,
                password=password,
                db=session,
            )
            print("-" * 60)
            print("✅ Admin account successfully provisioned!")
            print(f"   User ID   : {admin_user.id}")
            print(f"   Full Name : {admin_user.full_name}")
            print(f"   Email     : {admin_user.email}")
            print(f"   Role      : Admin (Role ID: {admin_user.role_id})")
            print("=" * 60)

    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except ValueError as err:
        print(f"\n❌ Validation Error: {err}")
        sys.exit(1)
    except Exception as exc:
        print(f"\n❌ Unexpected Failure: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    interactive_seed()
