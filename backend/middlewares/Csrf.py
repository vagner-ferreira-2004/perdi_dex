import hmac
from functools import wraps
from typing import Callable

from flask import current_app, jsonify, request


def csrfCookieName() -> str:
    return current_app.config["CSRF_COOKIE_NAME"]


def csrfFailure():
    cookie_token = request.cookies.get(csrfCookieName(), "")
    request_token = request.headers.get("X-CSRF-Token", "")
    if (
        not cookie_token
        or not request_token
        or not hmac.compare_digest(cookie_token, request_token)
    ):
        return jsonify({"error": "CSRF token missing or invalid"}), 403
    return None


def requireCsrf() -> Callable:
    def decorator(function: Callable) -> Callable:
        @wraps(function)
        def wrapped(*args, **kwargs):
            failure = csrfFailure()
            if failure:
                return failure
            return function(*args, **kwargs)

        return wrapped

    return decorator
