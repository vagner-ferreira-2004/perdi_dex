from database.database import Session
from errors import ConflictError, ServiceError
from helpers.HashPassword import hashPassword
from models import Profile, Role, User


def _requiredText(data: dict, field: str) -> str:
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ServiceError(f"{field} is required")
    return value.strip()


def registerUser(data: dict) -> dict:
    name = _requiredText(data, "name")
    cpf = _requiredText(data, "cpf")
    phone = _requiredText(data, "phone")
    email = _requiredText(data, "email")
    password = _requiredText(data, "password")
    id_profile = data.get("id_profile")
    if not isinstance(id_profile, int) or id_profile <= 0:
        raise ServiceError("id_profile is required")
    rgm = data.get("rgm")
    if rgm is not None:
        if not isinstance(rgm, str):
            raise ServiceError("rgm must be a string")
        rgm = rgm.strip() or None

    with Session.begin() as session:
        if session.query(User).filter_by(email=email).first():
            raise ConflictError("Email already registered")
        if session.query(User).filter_by(cpf=cpf).first():
            raise ConflictError("CPF already registered")

        profile = session.get(Profile, id_profile)
        if profile is None:
            raise ServiceError("Profile not found")
        if profile.name == "student" and not rgm:
            raise ServiceError("RGM is required for students")
        if rgm and session.query(User).filter_by(rgm=rgm).first():
            raise ConflictError("RGM already registered")

        common_role = session.query(Role).filter_by(name="common").one_or_none()
        if common_role is None:
            raise ServiceError("Common role is not configured")

        user = User(
            name=name,
            cpf=cpf,
            phone=phone,
            email=email,
            rgm=rgm,
            password_hash=hashPassword(password),
            id_profile=profile.id_profile,
            role_id=common_role.id_role,
        )
        session.add(user)
        session.flush()
        return {
            "id_user": user.id_user,
            "name": user.name,
            "cpf": user.cpf,
            "phone": user.phone,
            "email": user.email,
            "rgm": user.rgm,
            "id_profile": user.id_profile,
            "role": common_role.name,
        }
