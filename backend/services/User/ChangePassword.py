from database.database import Session
from errors import AuthenticationError, ServiceError
from helpers.HashPassword import hashPassword, verifyPassword

from .GetMe import getUserOrFail


def changePassword(user_id: int, data: dict) -> None:
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    if not isinstance(current_password, str) or not current_password.strip():
        raise ServiceError("current_password is required")
    if not isinstance(new_password, str) or not new_password.strip():
        raise ServiceError("new_password is required")

    with Session.begin() as session:
        user = getUserOrFail(session, user_id)
        if not verifyPassword(current_password, user.password_hash):
            raise AuthenticationError("Current password is invalid")
        user.password_hash = hashPassword(new_password)