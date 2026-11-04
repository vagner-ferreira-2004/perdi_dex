from database.database import Session
from models import Category, Location


def getCategories() -> list[dict]:
    with Session() as session:
        return [
            {"id_category": category.id_category, "name": category.name}
            for category in session.query(Category).order_by(Category.name).all()
        ]


def getLocations() -> list[dict]:
    with Session() as session:
        return [
            {
                "id_location": location.id_location,
                "central_place": location.central_place,
                "description": location.description,
            }
            for location in session.query(Location)
            .order_by(Location.central_place, Location.description)
            .all()
        ]
