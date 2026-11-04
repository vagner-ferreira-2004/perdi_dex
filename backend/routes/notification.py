from flask import Blueprint

from controllers.notification import (
    deleteNotificationController,
    listNotificationsController,
    markAllNotificationsReadController,
    markNotificationReadController,
    markNotificationUnreadController,
)
from middlewares.RequireAuth import requireAuth

notification_bp = Blueprint("notification", __name__)

notification_bp.get("/notifications")(
    requireAuth()(listNotificationsController)
)
notification_bp.patch("/notifications/read-all")(
    requireAuth()(markAllNotificationsReadController)
)
notification_bp.patch("/notifications/<int:id_notification>/read")(
    requireAuth()(markNotificationReadController)
)
notification_bp.patch("/notifications/<int:id_notification>/unread")(
    requireAuth()(markNotificationUnreadController)
)
notification_bp.delete("/notifications/<int:id_notification>")(
    requireAuth()(deleteNotificationController)
)
