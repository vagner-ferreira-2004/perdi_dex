from flask import Blueprint

from controllers.auth import csrfToken, login, logout, register
from middlewares.Csrf import requireCsrf
from middlewares.CreateLimiter import limiter

auth_bp = Blueprint("auth", __name__)

auth_bp.get("/auth/csrf")(csrfToken)
auth_bp.post("/auth/register")(
    limiter.limit("5 per hour")(requireCsrf()(register))
)
auth_bp.post("/auth/login")(
    limiter.limit("5 per minute")(requireCsrf()(login))
)
auth_bp.post("/auth/logout")(requireCsrf()(logout))
