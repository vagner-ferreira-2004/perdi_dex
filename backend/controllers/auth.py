import os
import secrets

from flask import Blueprint, current_app, jsonify, make_response, request
from pydantic import ValidationError

from errors import ServiceError
from middlewares.Csrf import csrfCookieName
from services.Session import loginUser, registerUser
from validators.RegisterSchema import LoginSchema, RegisterSchema


def _validationError(error: ValidationError):
    return jsonify(
        {"error": "Invalid request", "details": error.errors(include_context=False)}
    ), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def register():
    try:
        data = RegisterSchema.model_validate(request.get_json(silent=True) or {})
        return jsonify(registerUser(data.model_dump())), 201
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def login():
    try:
        data = LoginSchema.model_validate(request.get_json(silent=True) or {})
        token_data = loginUser(data.model_dump())
        response = make_response(jsonify({"message": "Login successful"}), 200)
        response.set_cookie(
            current_app.config["SESSION_COOKIE_NAME"],
            token_data["access_token"],
            max_age=int(os.getenv("JWT_EXPIRATION_MINUTES", "60")) * 60,
            httponly=True,
            secure=current_app.config["SESSION_COOKIE_SECURE"],
            samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
            path="/",
        )
        return response
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def csrfToken():
    token = secrets.token_urlsafe(32)
    response = make_response(jsonify({"csrf_token": token}), 200)
    response.set_cookie(
        csrfCookieName(),
        token,
        httponly=False,
        secure=current_app.config["SESSION_COOKIE_SECURE"],
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
        path="/",
    )
    response.headers["Cache-Control"] = "no-store"
    return response


def logout():
    response = make_response(jsonify({"message": "Logged out"}), 200)
    response.delete_cookie(
        current_app.config["SESSION_COOKIE_NAME"],
        path="/",
        secure=current_app.config["SESSION_COOKIE_SECURE"],
        httponly=True,
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
    )
    response.delete_cookie(
        csrfCookieName(),
        path="/",
        secure=current_app.config["SESSION_COOKIE_SECURE"],
        httponly=False,
        samesite=current_app.config["SESSION_COOKIE_SAMESITE"],
    )
    return response
