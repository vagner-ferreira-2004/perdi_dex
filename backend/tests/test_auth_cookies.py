import unittest
from unittest.mock import patch

from App import createApp


class AuthCookieTests(unittest.TestCase):
    def setUp(self):
        self.app = createApp()
        self.app.config.update(TESTING=True, SESSION_COOKIE_SECURE=True)
        self.client = self.app.test_client()

    def getCsrfToken(self):
        response = self.client.get("/auth/csrf")
        self.assertEqual(response.status_code, 200)
        return response.get_json()["csrf_token"]

    def test_login_sets_http_only_secure_cookie_without_returning_jwt(self):
        csrf_token = self.getCsrfToken()
        with patch("controllers.auth.loginUser", return_value={"access_token": "signed-token"}):
            response = self.client.post(
                "/auth/login",
                json={"email": "user@example.com", "password": "valid-password"},
                headers={"X-CSRF-Token": csrf_token},
            )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("access_token", response.get_json())
        cookie_header = response.headers["Set-Cookie"]
        self.assertIn("perdidex_session=signed-token", cookie_header)
        self.assertIn("HttpOnly", cookie_header)
        self.assertIn("Secure", cookie_header)
        self.assertIn("SameSite=Strict", cookie_header)

    def test_login_rejects_missing_csrf_token(self):
        with patch("controllers.auth.loginUser") as login_user:
            response = self.client.post(
                "/auth/login",
                json={"email": "user@example.com", "password": "valid-password"},
            )

        self.assertEqual(response.status_code, 403)
        login_user.assert_not_called()

    def test_cookie_authenticated_mutation_requires_csrf(self):
        self.client.set_cookie("perdidex_session", "signed-token")
        response = self.client.patch("/users/me", json={"name": "Changed Name"})
        self.assertEqual(response.status_code, 403)

    def test_cookie_authentication_loads_current_user(self):
        self.client.set_cookie("perdidex_session", "signed-token")
        with patch(
            "middlewares.RequireAuth.decodeToken",
            return_value={"sub": "9", "role": "common"},
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.user.getMe",
            return_value={"id_user": 9, "name": "Test User", "role": "common"},
        ):
            response = self.client.get("/users/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["id_user"], 9)

    def test_inactive_user_cannot_use_existing_token(self):
        self.client.set_cookie("perdidex_session", "signed-token")
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "9"}
        ), patch("middlewares.RequireAuth.getActiveRole", return_value=None):
            response = self.client.get("/users/me")

        self.assertEqual(response.status_code, 401)

    def test_logout_clears_session_and_csrf_cookies(self):
        csrf_token = self.getCsrfToken()
        self.client.set_cookie("perdidex_session", "signed-token")
        response = self.client.post(
            "/auth/logout",
            headers={"X-CSRF-Token": csrf_token},
        )
        self.assertEqual(response.status_code, 200)
        cookies = response.headers.getlist("Set-Cookie")
        self.assertTrue(any("perdidex_session=;" in cookie for cookie in cookies))
        self.assertTrue(any("perdidex_csrf=;" in cookie for cookie in cookies))


if __name__ == "__main__":
    unittest.main()
