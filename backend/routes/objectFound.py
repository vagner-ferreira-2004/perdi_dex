from flask import Blueprint

from controllers.objectFound import (
    createObjectFoundController,
    getObjectFoundController,
    getPhotoController,
    listObjectsFoundController,
    updateFoundDateController,
    updateStatusController,
)
from middlewares.RequireAuth import requireAuth

object_found_bp = Blueprint("object_found", __name__)

object_found_bp.get("/objects-found")(requireAuth()(listObjectsFoundController))
object_found_bp.post("/objects-found")(requireAuth()(createObjectFoundController))
object_found_bp.get("/objects-found/<int:id_object>")(
    requireAuth()(getObjectFoundController)
)
object_found_bp.patch("/objects-found/<int:id_object>/status")(
    requireAuth()(updateStatusController)
)
object_found_bp.patch("/objects-found/<int:id_object>/found-date")(
    requireAuth()(updateFoundDateController)
)

object_found_bp.get("/photos/<filename>")(getPhotoController)