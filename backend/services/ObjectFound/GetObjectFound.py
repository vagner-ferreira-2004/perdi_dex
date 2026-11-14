from typing import Optional

from database.database import Session
from errors import NotFoundError
from models import Characteristic, ObjectFound
from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload


def getObjectFoundOrFail(session, id_object: int) -> ObjectFound:
    obj = session.get(ObjectFound, id_object)
    if obj is None or not obj.is_active:
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
        "review_reason": obj.review_reason,
        "reviewed_at": obj.reviewed_at.isoformat() if obj.reviewed_at else None,
        "category": {
            "id_category": obj.category.id_category,
            "name": obj.category.name,
        },
        "location": {
            "id_location": obj.location.id_location,
            "central_place": obj.location.central_place,
            "description": obj.location.description,
        },
        "characteristic": {
            "color": characteristic.color,
            "brand": characteristic.brand,
            "description": characteristic.description,
        }
        if characteristic
        else None,
        "photo": {
            "source": photo.source,
            "url": photo.source
            if photo.public_id
            else f"/photos/{photo.source}",
        }
        if photo
        else None,
    }


def serializePublicObjectFound(obj: ObjectFound) -> dict:
    item = serializeObjectFoundDetail(obj)
    item.pop("id_user", None)
    return item


def getObjectFound(id_object: int) -> dict:
    with Session.begin() as session:
        obj = getObjectFoundOrFail(session, id_object)
        return serializeObjectFoundDetail(obj)


def getPublicObjectFound(id_object: int) -> dict:
    with Session.begin() as session:
        obj = session.scalar(
            select(ObjectFound)
            .where(
                ObjectFound.id_object == id_object,
                ObjectFound.is_active.is_(True),
                ObjectFound.status == "Encontrado",
            )
            .options(
                selectinload(ObjectFound.characteristic),
                selectinload(ObjectFound.photo),
                selectinload(ObjectFound.category),
                selectinload(ObjectFound.location),
            )
        )
        if obj is None:
            raise NotFoundError("Published item not found")
        return serializePublicObjectFound(obj)


def listObjectsFound(
    filters: dict,
    user_id: Optional[int] = None,
    published_only: bool = False,
) -> dict:
    page = filters.get("page", 1)
    per_page = filters.get("per_page", 20)

    query = select(ObjectFound).where(ObjectFound.is_active.is_(True))
    if published_only:
        query = query.where(ObjectFound.status == "Encontrado")
    if user_id is not None:
        query = query.where(ObjectFound.id_user == user_id)
    for field in ("status", "id_category", "id_location"):
        if filters.get(field) is not None and not (published_only and field == "status"):
            query = query.where(getattr(ObjectFound, field) == filters[field])
    if filters.get("found_date_from"):
        query = query.where(ObjectFound.found_date >= filters["found_date_from"])
    if filters.get("found_date_to"):
        query = query.where(ObjectFound.found_date <= filters["found_date_to"])
    if filters.get("color"):
        query = query.where(Characteristic.color == filters["color"])
    if filters.get("q"):
        term = f"%{filters['q']}%"
        query = query.join(Characteristic).where(
            or_(
                Characteristic.description.ilike(term),
                Characteristic.brand.ilike(term),
                Characteristic.color.ilike(term),
            )
        )

    with Session.begin() as session:
        total = session.scalar(select(func.count()).select_from(query.subquery()))
        order_by = (
            (ObjectFound.found_date.asc(), ObjectFound.id_object.asc())
            if filters.get("order") == "oldest"
            else (ObjectFound.found_date.desc(), ObjectFound.id_object.desc())
        )
        objects = session.scalars(
            query.options(
                selectinload(ObjectFound.characteristic),
                selectinload(ObjectFound.photo),
                selectinload(ObjectFound.category),
                selectinload(ObjectFound.location),
            )
            .order_by(*order_by)
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [
                (
                    serializePublicObjectFound(obj)
                    if published_only
                    else serializeObjectFoundDetail(obj)
                )
                for obj in objects
            ],
            "page": page,
            "per_page": per_page,
            "total": total,
        }