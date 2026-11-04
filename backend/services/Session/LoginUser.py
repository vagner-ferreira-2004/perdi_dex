import os

from database.database import Session
from helpers.GenerateToken import generateToken
from helpers.HashPassword import verifyPassword
from models import User
from errors import AuthenticationError


def loginUser(data: dict) -> dict:
    email = data.get("email")
    password = data.get("password")
    if not isinstance(email, str) or not email.strip():
        raise AuthenticationError("Invalid credentials")
    if not isinstance(password, str) or not password.strip():
        raise AuthenticationError("Invalid credentials")

    with Session() as session:
        user = session.query(User).filter_by(
            email=email.strip(), is_active=True
        ).one_or_none()
        if user is None or not verifyPassword(password, user.password_hash):
            raise AuthenticationError("Invalid credentials")

        expires_in = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))
        token = generateToken(
            {"sub": str(user.id_user), "role": user.role.name}, expires_in
        )
        return {"access_token": token, "token_type": "bearer"}
