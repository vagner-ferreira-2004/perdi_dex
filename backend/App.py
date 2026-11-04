import os

from flask import Flask, jsonify
from flask_limiter.errors import RateLimitExceeded

from middlewares.CreateLimiter import createLimiter
from routes import registerRoutes


def createApp() -> Flask:
    app = Flask(__name__)
    app.config.update(
        SESSION_COOKIE_NAME="perdidex_session",
        CSRF_COOKIE_NAME="perdidex_csrf",
        SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "false").lower()
        == "true",
        SESSION_COOKIE_SAMESITE="Strict",
    )
    createLimiter(app)

    @app.errorhandler(RateLimitExceeded)
    def handleRateLimitExceeded(error: RateLimitExceeded):
        return jsonify(
            {
                "error": "rate_limit_exceeded",
                "message": str(error.description),
            }
        ), 429

    registerRoutes(app)
    return app
