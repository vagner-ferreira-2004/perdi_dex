from flask import jsonify

from services import getCategories, getLocations, getProfiles


def listProfilesController():
    return jsonify({"items": getProfiles()}), 200


def listCategoriesController():
    return jsonify({"items": getCategories()}), 200


def listLocationsController():
    return jsonify({"items": getLocations()}), 200
