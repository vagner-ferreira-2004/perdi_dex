from flask import Flask

from routes.auth import auth_bp
from routes.objectFound import object_found_bp
from routes.user import user_bp


def registerRoutes(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(object_found_bp)
    app.register_blueprint(user_bp)
