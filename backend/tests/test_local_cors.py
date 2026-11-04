import unittest

from App import createApp


class LocalCorsTests(unittest.TestCase):
    def setUp(self):
        self.app = createApp()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_local_frontend_origin_can_read_api_with_credentials(self):
        response = self.client.get(
            "/auth/csrf",
            headers={"Origin": "http://localhost:5500"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:5500",
        )
        self.assertEqual(
            response.headers.get("Access-Control-Allow-Credentials"), "true"
        )
        self.assertIn("Origin", response.headers.get("Vary", ""))

    def test_local_frontend_preflight_allows_csrf_header(self):
        response = self.client.options(
            "/auth/register",
            headers={
                "Origin": "http://localhost:5500",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,x-csrf-token",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:5500",
        )
        self.assertIn(
            "X-CSRF-Token",
            response.headers.get("Access-Control-Allow-Headers", ""),
        )

    def test_other_origins_do_not_receive_cors_permission(self):
        response = self.client.get(
            "/auth/csrf",
            headers={"Origin": "http://localhost:5501"},
        )

        self.assertNotIn("Access-Control-Allow-Origin", response.headers)
        self.assertNotIn("Access-Control-Allow-Credentials", response.headers)


if __name__ == "__main__":
    unittest.main()
