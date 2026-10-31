from sqlalchemy.orm import Session, joinedload

from backend.auth.schemas import UserLogin, UserRegister
from backend.auth.security import hash_password, verify_password
from backend.database.models import Role, User


def register_user(user_data: UserRegister, db: Session) -> User:
    """Create a new Employee account."""
    normalized_email = user_data.email.strip().lower()

    existing_user = (
        db.query(User).filter(User.email == normalized_email).first()
    )
    if existing_user:
        raise ValueError("Email is already registered")

    if len(user_data.password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")

    employee_role = db.query(Role).filter(Role.name == "Employee").first()
    if not employee_role:
        employee_role = Role(name="Employee")
        db.add(employee_role)
        db.flush()

    new_user = User(
        full_name=user_data.full_name.strip(),
        email=normalized_email,
        hashed_password=hash_password(user_data.password),
        role_id=employee_role.id,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(user_data: UserLogin, db: Session) -> User:
    """Authenticate a user using email and password."""
    normalized_email = user_data.email.strip().lower()

    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.email == normalized_email)
        .first()
    )

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise ValueError("Invalid email or password")

    if not user.is_active:
        raise ValueError("Account is inactive")

    return user


def change_user_password(
    user: User,
    current_password: str,
    new_password: str,
    db: Session,
) -> User:
    """Update a user's password after verifying the current password."""
    if not verify_password(current_password, user.hashed_password):
        raise ValueError("Current password is incorrect")

    if current_password == new_password:
        raise ValueError("New password cannot be the same as current password")

    if len(new_password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")

    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user