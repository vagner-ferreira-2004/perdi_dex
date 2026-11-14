from flask import g, jsonify, request
from pydantic import ValidationError

from errors import ServiceError
from services.Dispute import (
    createDispute,
    listAdminDisputes,
    listEligibleDisputeItems,
    listUserDisputes,
    reviewDispute,
)
from validators.DisputeSchemas import (
    CreateDisputeSchema,
    ListEligibleDisputeItemsSchema,
    ListDisputesSchema,
    ListUserDisputesSchema,
    ReviewDisputeSchema,
)


def _validationError(error: ValidationError):
    return jsonify(
        {"error": "Invalid request", "details": error.errors(include_context=False)}
    ), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def createDisputeController(id_object):
    try:
        data = CreateDisputeSchema.model_validate(request.form.to_dict())
        return jsonify(
            createDispute(
                id_object,
                g.user_id,
                data.description,
                request.files.getlist("evidence"),
            )
        ), 201
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def listEligibleDisputeItemsController():
    try:
        params = ListEligibleDisputeItemsSchema.model_validate(request.args.to_dict())
        return jsonify(
            listEligibleDisputeItems(g.user_id, params.page, params.per_page)
        ), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def listUserDisputesController():
    try:
        params = ListUserDisputesSchema.model_validate(request.args.to_dict())
        return jsonify(
            listUserDisputes(g.user_id, params.page, params.per_page)
        ), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def listAdminDisputesController():
    try:
        params = ListDisputesSchema.model_validate(request.args.to_dict())
        return jsonify(
            listAdminDisputes(params.status, params.page, params.per_page)
        ), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def reviewDisputeController(id_dispute):
    try:
        data = ReviewDisputeSchema.model_validate(
            request.get_json(silent=True) or {}
        )
        return jsonify(reviewDispute(id_dispute, g.user_id, data.model_dump())), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)
