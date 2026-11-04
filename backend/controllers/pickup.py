from flask import g, jsonify, request
from pydantic import ValidationError

from errors import ServiceError
from services.Pickup import (
    cancelPickupRequest,
    confirmPickup,
    createPickupRequest,
    listAdminPickupRequests,
    listUserPickupRequests,
    reviewPickupRequest,
)
from validators.PickupRequestSchemas import (
    ListPickupRequestsSchema,
    ReviewPickupRequestSchema,
)


def _validationError(error: ValidationError):
    return jsonify(
        {"error": "Invalid request", "details": error.errors(include_context=False)}
    ), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def createPickupRequestController(id_object):
    try:
        return jsonify(createPickupRequest(id_object, g.user_id)), 201
    except ServiceError as error:
        return _serviceError(error)


def listUserPickupRequestsController():
    try:
        params = ListPickupRequestsSchema.model_validate(request.args.to_dict())
        return jsonify(
            listUserPickupRequests(
                g.user_id, params.page, params.per_page, params.status
            )
        ), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def cancelPickupRequestController(id_request):
    try:
        cancelPickupRequest(id_request, g.user_id)
        return jsonify({"message": "Pickup request cancelled"}), 200
    except ServiceError as error:
        return _serviceError(error)


def confirmPickupController(id_request):
    try:
        return jsonify(
            confirmPickup(id_request, g.user_id, request.get_json(silent=True) or {})
        ), 200
    except ServiceError as error:
        return _serviceError(error)


def listAdminPickupRequestsController():
    try:
        params = ListPickupRequestsSchema.model_validate(request.args.to_dict())
        return jsonify(
            listAdminPickupRequests(params.status, params.page, params.per_page)
        ), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def reviewPickupRequestController(id_request):
    try:
        data = ReviewPickupRequestSchema.model_validate(
            request.get_json(silent=True) or {}
        )
        return jsonify(
            reviewPickupRequest(id_request, g.user_id, data.model_dump())
        ), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)
