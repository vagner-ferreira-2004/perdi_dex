from errors import NotFoundError
from models import ObjectFound

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from database.database import Session


def getObjectFoundOrFail(session, id_object: int) -> ObjectFound:
    obj = session.get(ObjectFound, id_object)
    if obj is None:
        raise NotFoundError("Object found not found")
    return obj


def serializeObjectFound(obj: ObjectFound) -> dict:
    return {
        "id_object": obj.id_object,
        "id_user": obj.id_user,
        "id_category": obj.id_category,
        "id_location": obj.id_location,
        "status": obj.status,
        "found_date": obj.found_date.isoformat() if obj.found_date else None,
    }

def serializeObjectFoundDetail(obj: ObjectFound) -> dict:
    characteristic = obj.characteristic
    photo = obj.photo
    return {
        **serializeObjectFound(obj),
        "characteristic": {
            "color": characteristic.color,
            "brand": characteristic.brand,
            "description": characteristic.description,
        }
        if characteristic
        else None,
        "photo": {"source": photo.source, "url": f"/photos/{photo.source}"}
        if photo
        else None,
    }


def getObjectFound(id_object: int) -> dict:
    with Session.begin() as session:
        obj = getObjectFoundOrFail(session, id_object)
        return serializeObjectFoundDetail(obj)


def listObjectsFound(filters: dict) -> dict:
    page = filters.get("page", 1)
    per_page = filters.get("per_page", 20)

    query = select(ObjectFound)
    for field in ("status", "id_category", "id_location"):
        if field in filters:
            query = query.where(getattr(ObjectFound, field) == filters[field])

    with Session.begin() as session:
        total = session.scalar(select(func.count()).select_from(query.subquery()))
        objects = session.scalars(
            query.options(
                selectinload(ObjectFound.characteristic),
                selectinload(ObjectFound.photo),
            )
            .order_by(ObjectFound.found_date.desc(), ObjectFound.id_object.desc())
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [serializeObjectFoundDetail(obj) for obj in objects],
            "page": page,
            "per_page": per_page,
            "total": total,
        }