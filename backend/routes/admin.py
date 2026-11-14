from flask import Blueprint

from controllers.admin import deactivateUserController, listUsersController
from middlewares.RequireAuth import requireAuth, requireRole

admin_bp = Blueprint("admin", __name__)

admin_bp.get("/admin/users")(
    requireAuth()(requireRole("admin")(listUsersController))
)
admin_bp.delete("/admin/users/<int:id_user>")(
    requireAuth()(requireRole("admin")(deactivateUserController))
)
