from datetime import datetime, timedelta, timezone
import os
from typing import Any

import jwt
from dotenv import load_dotenv

load_dotenv()


def _secretKey() -> str:
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY must be configured")
    return secret_key


def generateToken(payload: dict[str, Any], expires_in: int) -> str:
    now = datetime.now(timezone.utc)
    token_payload = {**payload, "iat": now, "exp": now + timedelta(minutes=expires_in)}
    return jwt.encode(token_payload, _secretKey(), algorithm="HS256")


def decodeToken(token: str) -> dict[str, Any]:
    return jwt.decode(token, _secretKey(), algorithms=["HS256"])
