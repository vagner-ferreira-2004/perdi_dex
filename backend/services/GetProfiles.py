from database.database import Session
from models import Profile


def getProfiles() -> list[dict]:
    with Session() as session:
        profiles = session.query(Profile).order_by(Profile.id_profile).all()
        return [
            {
                "id_profile": profile.id_profile,
                "name": profile.name,
                "display_name": profile.display_name,
            }
            for profile in profiles
        ]
