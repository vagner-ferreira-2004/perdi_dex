from flask import Blueprint

from controllers.objectFound import (
    createObjectFoundController,
    deactivateObjectFoundController,
    getObjectFoundController,
    getPublicObjectFoundController,
    getPhotoController,
    listAdminObjectsFoundController,
    listPublicObjectsFoundController,
    listObjectsFoundController,
    reviewObjectFoundController,
    updateFoundDateController,
    updateObjectFoundController,
)
from middlewares.RequireAuth import requireAuth, requireRole

object_found_bp = Blueprint("object_found", __name__)

object_found_bp.get("/public/objects-found")(listPublicObjectsFoundController)
object_found_bp.get("/public/objects-found/<int:id_object>")(
    getPublicObjectFoundController
)
object_found_bp.get("/admin/objects-found")(
    requireAuth()(requireRole("admin")(listAdminObjectsFoundController))
)
object_found_bp.patch("/admin/objects-found/<int:id_object>/review")(
    requireAuth()(requireRole("admin")(reviewObjectFoundController))
)
object_found_bp.get("/objects-found")(requireAuth()(listObjectsFoundController))
object_found_bp.post("/objects-found")(requireAuth()(createObjectFoundController))
object_found_bp.get("/objects-found/<int:id_object>")(
    requireAuth()(getObjectFoundController)
)
object_found_bp.patch("/objects-found/<int:id_object>/found-date")(
    requireAuth()(updateFoundDateController)
)
object_found_bp.patch("/objects-found/<int:id_object>")(
    requireAuth()(updateObjectFoundController)
)
object_found_bp.delete("/objects-found/<int:id_object>")(
    requireAuth()(deactivateObjectFoundController)
)

object_found_bp.get("/photos/<filename>")(getPhotoController)