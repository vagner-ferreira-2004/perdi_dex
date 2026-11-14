from werkzeug.security import generate_password_hash

from database.database import Session
from models import Category, Location, Profile, Role, User


CATEGORIES = ["Cell Phone", "Wallet", "Keys", "Backpack", "Documents", "School Material"]
LOCATIONS = [
    ("Block A", "Corridor in front of room 4"),
    ("Cafeteria", "Next to Lab 5"),
]
PROFILES = {
    "student": "Student",
    "professor": "Professor",
    "staff": "Staff",
}
TEST_USER = {
    "name": "Development User",
    "cpf": "00000000000",
    "phone": "11999999999",
    "email": "dev@example.com",
    "rgm": "DEV0001",
    "password_hash": generate_password_hash("development-password"),
}


def seedDatabase() -> None:
    with Session.begin() as session:
        for name in ("common", "admin"):
            if session.query(Role).filter_by(name=name).first() is None:
                session.add(Role(name=name))
        session.flush()
        common_role = session.query(Role).filter_by(name="common").one()
        for name, display_name in PROFILES.items():
            if session.query(Profile).filter_by(name=name).first() is None:
                session.add(Profile(name=name, display_name=display_name))
        session.flush()
        for name in CATEGORIES:
            if session.query(Category).filter_by(name=name).first() is None:
                session.add(Category(name=name))
        for central_place, description in LOCATIONS:
            exists = session.query(Location).filter_by(
                central_place=central_place, description=description
            ).first()
            if exists is None:
                session.add(Location(central_place=central_place, description=description))
        student_profile = session.query(Profile).filter_by(name="student").one()
        if session.query(User).filter_by(email=TEST_USER["email"]).first() is None:
            session.add(
                User(
                    **TEST_USER,
                    id_profile=student_profile.id_profile,
                    role_id=common_role.id_role,
                )
            )
        else:
            development_user = session.query(User).filter_by(
                email=TEST_USER["email"]
            ).one()
            development_user.password_hash = TEST_USER["password_hash"]
            development_user.id_profile = student_profile.id_profile
            development_user.role_id = common_role.id_role


if __name__ == "__main__":
    seedDatabase()
    print("Development seeds inserted.")
