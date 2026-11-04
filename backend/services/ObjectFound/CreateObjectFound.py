from datetime import date

from database.database import Session
from errors import NotFoundError
from helpers.images import deleteImage, saveImage
from models import Category, Characteristic, Location, ObjectFound, Photo

from .GetObjectFound import serializeObjectFound

INITIAL_STATUS = "Pendente"


def createObjectFound(user_id: int, data: dict, photo_file) -> dict:
    filename = None
    try:
        with Session.begin() as session:
            if session.get(Category, data["id_category"]) is None:
                raise NotFoundError("Category not found")
            if session.get(Location, data["id_location"]) is None:
                raise NotFoundError("Location not found")

            filename = saveImage(photo_file)

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
            photo = Photo(id_object=obj.id_object, source=filename)
            session.add_all([characteristic, photo])
            session.flush()

            return {
                **serializeObjectFound(obj),
                "characteristic": {
                    "color": characteristic.color,
                    "brand": characteristic.brand,
                    "description": characteristic.description,
                },
                "photo": {"source": photo.source},
            }
    except Exception:
        if filename:
            deleteImage(filename)
        raise