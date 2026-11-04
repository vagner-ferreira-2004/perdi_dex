from flask import Flask

from routes.auth import auth_bp
from routes.dispute import dispute_bp
from routes.admin import admin_bp
from routes.objectFound import object_found_bp
from routes.notification import notification_bp
from routes.profile import profile_bp
from routes.pickup import pickup_bp
from routes.user import user_bp


def registerRoutes(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(object_found_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(pickup_bp)
    app.register_blueprint(dispute_bp)
    app.register_blueprint(user_bp)
