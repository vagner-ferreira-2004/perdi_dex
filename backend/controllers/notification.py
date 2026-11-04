from flask import g, jsonify, request
from pydantic import ValidationError

from errors import ServiceError
from services.Notification import (
    deleteNotification,
    listNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    markNotificationUnread,
)
from validators.ListNotificationsSchema import ListNotificationsSchema


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def listNotificationsController():
    try:
        params = ListNotificationsSchema.model_validate(request.args.to_dict())
        return jsonify(
            listNotifications(g.user_id, params.page, params.per_page)
        ), 200
    except ValidationError as error:
        return jsonify(
            {
                "error": "Invalid request",
                "details": error.errors(include_context=False),
            }
        ), 400
    except ServiceError as error:
        return _serviceError(error)


def markNotificationReadController(id_notification):
    try:
        markNotificationRead(id_notification, g.user_id)
        return jsonify({"message": "Notification marked as read"}), 200
    except ServiceError as error:
        return _serviceError(error)


def markNotificationUnreadController(id_notification):
    try:
        markNotificationUnread(id_notification, g.user_id)
        return jsonify({"message": "Notification marked as unread"}), 200
    except ServiceError as error:
        return _serviceError(error)


def markAllNotificationsReadController():
    try:
        updated = markAllNotificationsRead(g.user_id)
        return jsonify({"updated": updated}), 200
    except ServiceError as error:
        return _serviceError(error)


def deleteNotificationController(id_notification):
    try:
        deleteNotification(id_notification, g.user_id)
        return jsonify({"message": "Notification deleted"}), 200
    except ServiceError as error:
        return _serviceError(error)
