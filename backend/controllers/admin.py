from flask import g, jsonify, request
from pydantic import ValidationError

from errors import ServiceError
from services.Admin import deactivateUser, listUsers
from validators.ListUsersSchema import ListUsersSchema


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def listUsersController():
    try:
        params = ListUsersSchema.model_validate(request.args.to_dict())
        return jsonify(listUsers(params.page, params.per_page)), 200
    except ValidationError as error:
        return jsonify(
            {
                "error": "Invalid request",
                "details": error.errors(include_context=False),
            }
        ), 400
    except ServiceError as error:
        return _serviceError(error)


def deactivateUserController(id_user):
    try:
        deactivateUser(id_user, g.user_id)
        return jsonify({"message": "User deactivated successfully"}), 200
    except ServiceError as error:
        return _serviceError(error)
