import unittest
from unittest.mock import patch

from App import createApp


class NotificationRouteTests(unittest.TestCase):
    def setUp(self):
        self.app = createApp()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        self.headers = {"Authorization": "Bearer signed-token"}

    def auth(self):
        return (
            patch("middlewares.RequireAuth.decodeToken", return_value={"sub": "7"}),
            patch("middlewares.RequireAuth.getActiveRole", return_value="common"),
        )

    def test_list_returns_only_service_scoped_notifications(self):
        result = {
            "items": [],
            "page": 1,
            "per_page": 20,
            "total": 0,
            "unread": 0,
        }
        decode, role = self.auth()
        with decode, role, patch(
            "controllers.notification.listNotifications", return_value=result
        ) as listing:
            response = self.client.get("/notifications", headers=self.headers)

        self.assertEqual(response.status_code, 200)
        listing.assert_called_once_with(7, 1, 20)
        self.assertEqual(response.get_json()["unread"], 0)

    def test_mark_all_read_is_authenticated(self):
        decode, role = self.auth()
        with decode, role, patch(
            "controllers.notification.markAllNotificationsRead", return_value=3
        ) as mark_all:
            response = self.client.patch("/notifications/read-all", headers=self.headers)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["updated"], 3)
        mark_all.assert_called_once_with(7)


if __name__ == "__main__":
    unittest.main()
