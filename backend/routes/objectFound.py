from flask import Blueprint

from controllers.objectFound import (
    createObjectFoundController,
    updateFoundDateController,
    updateStatusController,
)
from middlewares.RequireAuth import requireAuth

object_found_bp = Blueprint("object_found", __name__)

object_found_bp.post("/objects-found")(requireAuth()(createObjectFoundController))
object_found_bp.patch("/objects-found/<int:id_object>/status")(
    requireAuth()(updateStatusController)
)
object_found_bp.patch("/objects-found/<int:id_object>/found-date")(
    requireAuth()(updateFoundDateController)
)