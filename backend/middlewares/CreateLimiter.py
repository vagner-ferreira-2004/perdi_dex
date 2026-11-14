import os

from dotenv import load_dotenv
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()

limiter = Limiter(key_func=get_remote_address)


def createLimiter(app: Flask) -> Limiter:
    storage_uri = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    default_limits = os.getenv("RATELIMIT_DEFAULT", "50 per minute")
    app.config["RATELIMIT_STORAGE_URI"] = storage_uri
    app.config["RATELIMIT_DEFAULT"] = default_limits
    limiter.init_app(app)
    return limiter
