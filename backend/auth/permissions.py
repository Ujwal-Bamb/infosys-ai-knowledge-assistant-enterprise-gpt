from fastapi import Depends, HTTPException, status

from backend.auth.dependencies import get_current_user
from backend.database.models import User


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Allow access only to Admin users."""
    if not current_user.role or current_user.role.name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user