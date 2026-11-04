import unittest
from unittest.mock import patch

from App import createApp


class PickupDisputeAccessTests(unittest.TestCase):
    def setUp(self):
        self.app = createApp()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        self.auth = {"Authorization": "Bearer mocked-token"}

    def test_user_lists_own_pickup_requests(self):
        result = {"items": [], "page": 1, "per_page": 25, "total": 0}
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.pickup.listUserPickupRequests", return_value=result
        ) as listing:
            response = self.client.get("/pickup-requests", headers=self.auth)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), result)
        listing.assert_called_once_with(4, 1, 25, None)

    def test_common_user_cannot_review_pickup_requests(self):
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch("controllers.pickup.reviewPickupRequest") as review:
            response = self.client.patch(
                "/admin/pickup-requests/12/review",
                headers=self.auth,
                json={"decision": "approve"},
            )

        self.assertEqual(response.status_code, 403)
        review.assert_not_called()

    def test_user_can_load_disputeable_items(self):
        result = {"items": [], "page": 1, "per_page": 20, "total": 0}
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.dispute.listEligibleDisputeItems", return_value=result
        ) as listing:
            response = self.client.get(
                "/disputes/eligible-items?page=1&per_page=20",
                headers=self.auth,
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), result)
        listing.assert_called_once_with(4, 1, 20)

    def test_user_can_load_their_dispute_history(self):
        result = {"items": [], "page": 1, "per_page": 20, "total": 0}
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.dispute.listUserDisputes", return_value=result
        ) as listing:
            response = self.client.get(
                "/disputes?page=1&per_page=20",
                headers=self.auth,
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), result)
        listing.assert_called_once_with(4, 1, 20)

    def test_dispute_submission_passes_description_and_files(self):
        result = {"id_dispute": 8, "status": "Pendente"}
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.dispute.createDispute", return_value=result
        ) as create:
            response = self.client.post(
                "/objects-found/12/disputes",
                headers=self.auth,
                data={"description": "Este item tem sinais particulares meus."},
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json(), result)
        create.assert_called_once()
        self.assertEqual(create.call_args.args[:3], (12, 4, "Este item tem sinais particulares meus."))
        self.assertEqual(create.call_args.args[3], [])

    def test_rejecting_dispute_requires_a_reason(self):
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "2"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="admin"
        ):
            response = self.client.patch(
                "/admin/disputes/8/review",
                headers=self.auth,
                json={"decision": "reject"},
            )

        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
