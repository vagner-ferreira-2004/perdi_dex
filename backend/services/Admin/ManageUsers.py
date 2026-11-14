from database.database import Session
from errors import ConflictError, NotFoundError
from models import User
from sqlalchemy import func, select


def listUsers(page: int = 1, per_page: int = 25) -> dict:
    query = select(User).where(User.is_active.is_(True))
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(query.subquery()))
        users = session.scalars(
            query.order_by(User.name, User.id_user)
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [
                {
                    "id_user": user.id_user,
                    "name": user.name,
                    "email": user.email,
                    "profile": user.profile.name,
                    "role": user.role.name,
                }
                for user in users
            ],
            "page": page,
            "per_page": per_page,
            "total": total,
        }


def deactivateUser(user_id: int, admin_id: int) -> None:
    if user_id == admin_id:
        raise ConflictError("Administrators cannot deactivate their own account here")
    with Session.begin() as session:
        user = session.get(User, user_id)
        if user is None or not user.is_active:
            raise NotFoundError("Active user not found")
        user.is_active = False
