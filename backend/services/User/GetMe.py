from database.database import Session
from models import User
from errors import NotFoundError


def getUserOrFail(session, user_id: int) -> User:
    user = session.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


def serializeUser(user: User) -> dict:
    return {
        "id_user": user.id_user,
        "name": user.name,
        "cpf": user.cpf,
        "phone": user.phone,
        "email": user.email,
        "rgm": user.rgm,
        "id_profile": user.id_profile,
        "profile": user.profile.name,
        "role": user.role.name,
    }


def getMe(user_id: int) -> dict:
    with Session() as session:
        return serializeUser(getUserOrFail(session, user_id))
