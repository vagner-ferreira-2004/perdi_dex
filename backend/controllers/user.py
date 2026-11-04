from flask import g, jsonify, request
from pydantic import ValidationError

from errors import ServiceError
from services.User import changePassword, deleteMe, getMe, updateMe
from validators.RegisterSchema import ChangePasswordSchema
from validators.UpdateUserSchema import UpdateUserSchema


def _validationError(error: ValidationError):
    return jsonify(
        {"error": "Invalid request", "details": error.errors(include_context=False)}
    ), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def getMeController():
    try:
        return jsonify(getMe(g.user_id)), 200
    except ServiceError as error:
        return _serviceError(error)


def updateMeController():
    try:
        data = UpdateUserSchema.model_validate(request.get_json(silent=True) or {})
        return jsonify(updateMe(g.user_id, data.model_dump(exclude_none=True))), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def changePasswordController():
    try:
        data = ChangePasswordSchema.model_validate(request.get_json(silent=True) or {})
        changePassword(g.user_id, data.model_dump())
        return jsonify({"message": "Password changed successfully"}), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def deleteMeController():
    try:
        deleteMe(g.user_id, request.get_json(silent=True) or {})
        return jsonify({"message": "Account deactivated successfully"}), 200
    except ServiceError as error:
        return _serviceError(error)
