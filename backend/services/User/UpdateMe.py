from database.database import Session
from errors import ConflictError, ServiceError
from models import User

from .GetMe import getUserOrFail, serializeUser


def updateMe(user_id: int, data: dict) -> dict:
    updates = {}
    for field in ("name", "phone", "email"):
        if field in data:
            value = data[field]
            if not isinstance(value, str) or not value.strip():
                raise ServiceError(f"{field} cannot be empty")
            updates[field] = value.strip()

    with Session.begin() as session:
        user = getUserOrFail(session, user_id)
        if updates.get("email") and updates["email"] != user.email:
            duplicate = session.query(User).filter(
                User.email == updates["email"], User.id_user != user_id
            ).first()
            if duplicate:
                raise ConflictError("Email already registered")
        for field, value in updates.items():
            setattr(user, field, value)
        session.flush()
        return serializeUser(user)