from flask import g, jsonify, request 
from pydantic import ValidationError 

from errors import ServiceError
from services.ObjectFound import updateStatus, updateFoundDate
from validators.UpdateStatusSchema import UpdateStatusSchema
from validators.UpdateFoundDateSchema import UpdateFoundDateSchema

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
        return jsonify({"errors": error.errors()}), 400
    except ServiceError as error:
        return jsonify({"error": str(error)}), error.status_code

def updateFoundDateController(id_object):
    try:
        data = UpdateFoundDateSchema.model_validate(request.get_json(silent=True) or {})
        update = updateFoundDate(id_object, g.user_id, data.model_dump())
        return jsonify(update), 200
    except ValidationError as error:
        return jsonify({"errors": error.errors()}), 400
    except ServiceError as error:
        return jsonify({"error": str(error)}), error.status_code

