from database.database import Session
from errors import AuthenticationError, ServiceError
from helpers.HashPassword import verifyPassword

from .GetMe import getUserOrFail


def deleteMe(user_id: int, data: dict) -> None:
    current_password = data.get("current_password")
    if not isinstance(current_password, str) or not current_password:
        raise ServiceError("current_password is required")

    with Session.begin() as session:
        user = getUserOrFail(session, user_id)
        if not verifyPassword(current_password, user.password_hash):
            raise AuthenticationError("Current password is invalid")
        user.is_active = False
