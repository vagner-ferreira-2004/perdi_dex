from flask import g, jsonify, request
from pydantic import ValidationError

from errors import ServiceError
from services.ObjectFound import createObjectFound, updateFoundDate, updateStatus
from validators.CreateObjectFoundSchema import CreateObjectFoundSchema
from validators.UpdateFoundDateSchema import UpdateFoundDateSchema
from validators.UpdateStatusSchema import UpdateStatusSchema


def _validationError(error: ValidationError):
    return jsonify({"error": "Invalid request", "details": error.errors()}), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def updateStatusController(id_object):
    try:
        data = UpdateStatusSchema.model_validate(request.get_json(silent=True) or {})
        update = updateStatus(id_object, g.user_id, data.model_dump(exclude_none=True))
        return jsonify(update), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def updateFoundDateController(id_object):
    try:
        data = UpdateFoundDateSchema.model_validate(request.get_json(silent=True) or {})
        update = updateFoundDate(id_object, g.user_id, data.model_dump())
        return jsonify(update), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def createObjectFoundController():
    try:
        data = CreateObjectFoundSchema.model_validate(request.form.to_dict())
        created = createObjectFound(
            g.user_id,
            data.model_dump(exclude_none=True),
            request.files.get("photo"),
        )
        return jsonify(created), 201
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)