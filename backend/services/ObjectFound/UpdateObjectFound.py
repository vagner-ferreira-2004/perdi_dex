import logging

from database.database import Session
from errors import AuthorizationError, NotFoundError, ServiceError
from helpers.images import deleteImage, saveImage
from models import Category, Location

from .GetObjectFound import getObjectFoundOrFail, serializeObjectFoundDetail

logger = logging.getLogger(__name__)
EDITABLE_STATUSES = {"Pendente", "Encontrado", "Reprovado"}


def updateObjectFound(id_object: int, user_id: int, data: dict, photo_file=None) -> dict:
    uploaded_image = None
    old_public_id = None
    try:
        with Session.begin() as session:
            obj = getObjectFoundOrFail(session, id_object)
            if obj.id_user != user_id:
                raise AuthorizationError("You cannot update this object")
            if obj.status not in EDITABLE_STATUSES:
                raise ServiceError("This item can no longer be edited")

            if "id_category" in data and session.get(Category, data["id_category"]) is None:
                raise NotFoundError("Category not found")
            if "id_location" in data and session.get(Location, data["id_location"]) is None:
                raise NotFoundError("Location not found")

            if photo_file:
                uploaded_image = saveImage(photo_file)

            for field in ("id_category", "id_location", "found_date"):
                if field in data:
                    setattr(obj, field, data[field])

            characteristic = obj.characteristic
            if characteristic is None and any(
                field in data for field in ("color", "brand", "description")
            ):
                raise ServiceError("Item characteristics are unavailable")
            for field in ("color", "brand", "description"):
                if field in data:
                    setattr(characteristic, field, data[field])

            if uploaded_image:
                photo = obj.photo
                old_public_id = photo.public_id
                photo.source = uploaded_image["url"]
                photo.public_id = uploaded_image["public_id"]

            if obj.status != "Pendente":
                obj.status = "Pendente"
                obj.review_reason = None
                obj.reviewed_by = None
                obj.reviewed_at = None
            session.flush()
            result = serializeObjectFoundDetail(obj)

        if old_public_id:
            try:
                deleteImage(old_public_id)
            except Exception:
                logger.exception("Failed to remove replaced Cloudinary image %s", old_public_id)
        return result
    except Exception:
        if uploaded_image:
            try:
                deleteImage(uploaded_image["public_id"])
            except Exception:
                logger.exception(
                    "Failed to clean up Cloudinary image %s after item update failed",
                    uploaded_image["public_id"],
                )
        raise


def deactivateObjectFound(id_object: int, user_id: int) -> None:
    with Session.begin() as session:
        obj = getObjectFoundOrFail(session, id_object)
        if obj.id_user != user_id:
            raise AuthorizationError("You cannot deactivate this object")
        obj.is_active = False
