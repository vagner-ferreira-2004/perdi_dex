from flask import Blueprint

from controllers.profile import (
    listCategoriesController,
    listLocationsController,
    listProfilesController,
)

profile_bp = Blueprint("profile", __name__)
profile_bp.get("/profiles")(listProfilesController)
profile_bp.get("/categories")(listCategoriesController)
profile_bp.get("/locations")(listLocationsController)
