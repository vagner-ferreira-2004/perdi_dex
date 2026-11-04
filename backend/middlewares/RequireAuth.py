from functools import wraps
from typing import Callable

import jwt
from flask import current_app, g, jsonify, request

from database.database import Session
from middlewares.Csrf import csrfFailure
from helpers.GenerateToken import decodeToken
from models import User


def getActiveRole(user_id: int):
    with Session() as session:
        user = session.get(User, user_id)
        if user is None or not user.is_active:
            return None
        return user.role.name


def requireAuth() -> Callable:
    def decorator(function: Callable) -> Callable:
        @wraps(function)
        def wrapped(*args, **kwargs):
            authorization = request.headers.get("Authorization", "")
            scheme, _, token = authorization.partition(" ")
            cookie_token = request.cookies.get(current_app.config["SESSION_COOKIE_NAME"])
            uses_cookie = not (scheme.lower() == "bearer" and token) and bool(cookie_token)
            if uses_cookie:
                token = cookie_token
            elif scheme.lower() != "bearer" or not token:
                return jsonify({"error": "Authentication required"}), 401
            if uses_cookie and request.method not in {"GET", "HEAD", "OPTIONS"}:
                csrf_response = csrfFailure()
                if csrf_response is not None:
                    return csrf_response
            try:
                payload = decodeToken(token)
                user_id = payload.get("sub")
                if user_id is None:
                    raise jwt.InvalidTokenError("Missing subject")
                g.user_id = int(user_id)
            except (ValueError, jwt.InvalidTokenError, jwt.PyJWTError):
                return jsonify({"error": "Invalid or expired token"}), 401
            role = getActiveRole(g.user_id)
            if role is None:
                return jsonify({"error": "Invalid or expired token"}), 401
            g.role = role
            return function(*args, **kwargs)

        return wrapped

    return decorator


def requireRole(role_name: str) -> Callable:
    def decorator(function: Callable) -> Callable:
        @wraps(function)
        def wrapped(*args, **kwargs):
            if getattr(g, "role", None) != role_name:
                return jsonify({"error": "Insufficient permissions"}), 403
            return function(*args, **kwargs)

        return wrapped

    return decorator
