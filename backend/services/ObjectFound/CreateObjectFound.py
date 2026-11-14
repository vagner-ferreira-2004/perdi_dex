from datetime import date
import logging

from database.database import Session
from errors import NotFoundError
from helpers.images import deleteImage, saveImage
from models import Category, Characteristic, Location, ObjectFound, Photo
from services.Notification import notifyAdmins

from .GetObjectFound import serializeObjectFound

INITIAL_STATUS = "Pendente"
logger = logging.getLogger(__name__)


def createObjectFound(user_id: int, data: dict, photo_file) -> dict:
    uploaded_image = None
    try:
        with Session.begin() as session:
            if session.get(Category, data["id_category"]) is None:
                raise NotFoundError("Category not found")
            if session.get(Location, data["id_location"]) is None:
                raise NotFoundError("Location not found")

            uploaded_image = saveImage(photo_file)

            obj = ObjectFound(
                id_user=user_id,
                id_category=data["id_category"],
                id_location=data["id_location"],
                status=INITIAL_STATUS,
                found_date=data.get("found_date") or date.today(),
            )
            session.add(obj)
            session.flush()

            characteristic = Characteristic(
                id_object=obj.id_object,
                color=data["color"],
                brand=data["brand"],
                description=data["description"],
            )
            photo = Photo(
                id_object=obj.id_object,
                source=uploaded_image["url"],
                public_id=uploaded_image["public_id"],
            )
            session.add_all([characteristic, photo])
            session.flush()
            notifyAdmins(
                session,
                "cadastro",
                "Novo item aguarda análise",
                "Um novo item foi enviado para revisão administrativa.",
                obj.id_object,
                "/pages/admin/analises.html",
            )

            return {
                **serializeObjectFound(obj),
                "characteristic": {
                    "color": characteristic.color,
                    "brand": characteristic.brand,
                    "description": characteristic.description,
                },
                "photo": {
                    "source": photo.source,
                    "url": photo.source,
                },
            }
    except Exception:
        if uploaded_image:
            try:
                deleteImage(uploaded_image["public_id"])
            except Exception:
                logger.exception(
                    "Failed to clean up Cloudinary image %s after item creation failed",
                    uploaded_image["public_id"],
                )
        raise