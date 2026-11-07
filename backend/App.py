import os

from flask import Flask, jsonify, request
from flask_limiter.errors import RateLimitExceeded

from middlewares.CreateLimiter import createLimiter
from routes import registerRoutes


def createApp() -> Flask:
    app = Flask(__name__)
    cors_origins = {
        origin.strip()
        for origin in os.getenv(
            "CORS_ALLOWED_ORIGINS", "http://localhost:5500"
        ).split(",")
        if origin.strip()
    }
    app.config.update(
        SESSION_COOKIE_NAME="perdidex_session",
        CSRF_COOKIE_NAME="perdidex_csrf",
        SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "false").lower()
        == "true",
        SESSION_COOKIE_SAMESITE=os.getenv("SESSION_COOKIE_SAMESITE", "Strict"),
        CORS_ALLOWED_ORIGINS=cors_origins,
    )
    createLimiter(app)

    @app.after_request
    def addCorsHeaders(response):
        origin = request.headers.get("Origin")
        if origin in app.config["CORS_ALLOWED_ORIGINS"]:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, HEAD, POST, PATCH, DELETE, OPTIONS"
            )
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, X-CSRF-Token, Authorization"
            )
            response.vary.add("Origin")
        return response

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
