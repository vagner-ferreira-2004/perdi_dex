from flask import Blueprint

from controllers.user import (
    changePasswordController,
    deleteMeController,
    getMeController,
    updateMeController,
)
from middlewares.CreateLimiter import limiter
from middlewares.RequireAuth import requireAuth

user_bp = Blueprint("user", __name__)

user_bp.get("/users/me")(requireAuth()(getMeController))
user_bp.patch("/users/me")(requireAuth()(updateMeController))
user_bp.delete("/users/me")(
    limiter.limit("10 per hour")(requireAuth()(deleteMeController))
)
user_bp.patch("/users/me/password")(
    limiter.limit("20 per hour")(requireAuth()(changePasswordController))
)
