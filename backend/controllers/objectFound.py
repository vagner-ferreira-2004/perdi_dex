from flask import g, jsonify, request, send_from_directory
from pydantic import ValidationError
from werkzeug.exceptions import NotFound

from errors import ServiceError
from helpers.images import UPLOAD_DIR
from services.Admin import reviewObjectFound
from services.ObjectFound import (
    createObjectFound,
    getObjectFound,
    getPublicObjectFound,
    listObjectsFound,
    deactivateObjectFound,
    updateObjectFound,
    updateFoundDate,
)
from validators.CreateObjectFoundSchema import CreateObjectFoundSchema
from validators.ListObjectsFoundSchema import ListObjectsFoundSchema
from validators.ReviewObjectFoundSchema import ReviewObjectFoundSchema
from validators.UpdateFoundDateSchema import UpdateFoundDateSchema
from validators.UpdateObjectFoundSchema import UpdateObjectFoundSchema


def _validationError(error: ValidationError):
    return jsonify(
        {"error": "Invalid request", "details": error.errors(include_context=False)}
    ), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


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


def updateObjectFoundController(id_object):
    try:
        payload = request.form.to_dict() or request.get_json(silent=True) or {}
        data = UpdateObjectFoundSchema.model_validate(payload)
        updated = updateObjectFound(
            id_object,
            g.user_id,
            data.model_dump(exclude_none=True, exclude_unset=True),
            request.files.get("photo"),
        )
        return jsonify(updated), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def deactivateObjectFoundController(id_object):
    try:
        deactivateObjectFound(id_object, g.user_id)
        return jsonify({"message": "Item deactivated successfully"}), 200
    except ServiceError as error:
        return _serviceError(error)


def listObjectsFoundController():
    try:
        data = ListObjectsFoundSchema.model_validate(request.args.to_dict())
        result = listObjectsFound(data.model_dump(exclude_none=True), g.user_id)
        return jsonify(result), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def listPublicObjectsFoundController():
    try:
        data = ListObjectsFoundSchema.model_validate(request.args.to_dict())
        filters = data.model_dump(exclude_none=True)
        filters.pop("status", None)
        result = listObjectsFound(
            filters,
            published_only=True,
        )
        return jsonify(result), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def listAdminObjectsFoundController():
    try:
        data = ListObjectsFoundSchema.model_validate(request.args.to_dict())
        result = listObjectsFound(data.model_dump(exclude_none=True))
        return jsonify(result), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def reviewObjectFoundController(id_object):
    try:
        data = ReviewObjectFoundSchema.model_validate(
            request.get_json(silent=True) or {}
        )
        return jsonify(reviewObjectFound(id_object, g.user_id, data.model_dump())), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def getObjectFoundController(id_object):
    try:
        return jsonify(getObjectFound(id_object)), 200
    except ServiceError as error:
        return _serviceError(error)


def getPublicObjectFoundController(id_object):
    try:
        return jsonify(getPublicObjectFound(id_object)), 200
    except ServiceError as error:
        return _serviceError(error)


def getPhotoController(filename):
    try:
        return send_from_directory(UPLOAD_DIR, filename)
    except NotFound:
        return jsonify({"error": "Photo not found"}), 404