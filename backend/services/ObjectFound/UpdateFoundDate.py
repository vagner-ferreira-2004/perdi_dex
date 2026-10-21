from datetime import date

from database.database import Session
from errors import AuthorizationError, ServiceError

from .GetObjectFound import getObjectFoundOrFail, serializeObjectFound


def updateFoundDate(id_object: int, user_id: int, data: dict) -> dict:
    if "found_date" not in data:
        raise ServiceError("found_date is required")

    found_date = data["found_date"]
    if not isinstance(found_date, date):
        raise ServiceError("found_date must be a valid date")

    with Session.begin() as session:
        obj = getObjectFoundOrFail(session, id_object)
        if obj.id_user != user_id:
            raise AuthorizationError("You cannot update this object")
        obj.found_date = found_date
        session.flush()
        return serializeObjectFound(obj)