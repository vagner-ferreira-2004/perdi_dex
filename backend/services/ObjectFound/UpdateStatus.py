from database.database import Session
from errors import AuthorizationError, ServiceError

from .GetObjectFound import getObjectFoundOrFail, serializeObjectFound

VALID_STATUSES = {"Pendente", "Encontrado", "Devolvido"}


def updateStatus(id_object: int, user_id: int, data: dict) -> dict:
    if "status" not in data:
        raise ServiceError("status is required")

    status = data["status"]
    if status not in VALID_STATUSES:
        raise ServiceError(f"invalid status: {status}")

    with Session.begin() as session:
        obj = getObjectFoundOrFail(session, id_object)
        if obj.id_user != user_id:
            raise AuthorizationError("You cannot update this object")
        obj.status = status
        session.flush()
        return serializeObjectFound(obj)