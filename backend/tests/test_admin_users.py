import unittest
from unittest.mock import patch

from App import createApp


class AdminUserTests(unittest.TestCase):
    def setUp(self):
        self.app = createApp()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        self.auth = {"Authorization": "Bearer signed-token"}

    def test_user_listing_requires_admin(self):
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch("middlewares.RequireAuth.getActiveRole", return_value="common"):
            response = self.client.get("/admin/users", headers=self.auth)

        self.assertEqual(response.status_code, 403)

    def test_admin_lists_only_projected_user_data(self):
        result = {
            "items": [
                {
                    "id_user": 5,
                    "name": "Pessoa",
                    "email": "pessoa@example.com",
                    "profile": "student",
                    "role": "common",
                }
            ],
            "page": 1,
            "per_page": 25,
            "total": 1,
        }
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "2"}
        ), patch("middlewares.RequireAuth.getActiveRole", return_value="admin"), patch(
            "controllers.admin.listUsers", return_value=result
        ) as listing:
            response = self.client.get("/admin/users?page=1&per_page=25", headers=self.auth)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), result)
        listing.assert_called_once_with(1, 25)

    def test_admin_can_deactivate_another_user(self):
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "2"}
        ), patch("middlewares.RequireAuth.getActiveRole", return_value="admin"), patch(
            "controllers.admin.deactivateUser"
        ) as deactivate:
            response = self.client.delete("/admin/users/5", headers=self.auth)

        self.assertEqual(response.status_code, 200)
        deactivate.assert_called_once_with(5, 2)


if __name__ == "__main__":
    unittest.main()
