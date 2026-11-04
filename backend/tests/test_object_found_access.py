import unittest
from unittest.mock import patch

from App import createApp


class ObjectFoundAccessTests(unittest.TestCase):
    def setUp(self):
        self.app = createApp()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_public_listing_forces_published_scope(self):
        result = {"items": [], "page": 1, "per_page": 20, "total": 0}
        with patch("controllers.objectFound.listObjectsFound", return_value=result) as listing:
            response = self.client.get("/public/objects-found?status=Pendente")

        self.assertEqual(response.status_code, 200)
        filters = listing.call_args.args[0]
        self.assertNotEqual(filters.get("status"), "Pendente")
        self.assertTrue(listing.call_args.kwargs["published_only"])

    def test_regular_user_cannot_access_admin_review(self):
        with patch(
            "middlewares.RequireAuth.decodeToken",
            return_value={"sub": "4", "role": "common"},
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch("controllers.objectFound.reviewObjectFound") as review:
            response = self.client.patch(
                "/admin/objects-found/12/review",
                headers={"Authorization": "Bearer test-token"},
                json={"decision": "approve"},
            )

        self.assertEqual(response.status_code, 403)
        review.assert_not_called()

    def test_admin_can_review_a_pending_item(self):
        result = {"id_object": 12, "status": "Encontrado"}
        with patch(
            "middlewares.RequireAuth.decodeToken",
            return_value={"sub": "2", "role": "admin"},
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="admin"
        ), patch(
            "controllers.objectFound.reviewObjectFound", return_value=result
        ) as review:
            response = self.client.patch(
                "/admin/objects-found/12/review",
                headers={"Authorization": "Bearer test-token"},
                json={"decision": "approve"},
            )

        self.assertEqual(response.status_code, 200)
        review.assert_called_once_with(12, 2, {"decision": "approve", "reason": None})

    def test_rejection_requires_a_reason(self):
        with patch(
            "middlewares.RequireAuth.decodeToken",
            return_value={"sub": "2", "role": "admin"},
        ), patch("middlewares.RequireAuth.getActiveRole", return_value="admin"):
            response = self.client.patch(
                "/admin/objects-found/12/review",
                headers={"Authorization": "Bearer test-token"},
                json={"decision": "reject"},
            )
        self.assertEqual(response.status_code, 400)

    def test_owner_item_deactivation_uses_authenticated_route(self):
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.objectFound.deactivateObjectFound"
        ) as deactivate:
            response = self.client.delete(
                "/objects-found/12",
                headers={"Authorization": "Bearer signed-token"},
            )

        self.assertEqual(response.status_code, 200)
        deactivate.assert_called_once_with(12, 4)

    def test_owner_item_update_accepts_multipart_contract(self):
        result = {"id_object": 12, "status": "Pendente"}
        with patch(
            "middlewares.RequireAuth.decodeToken", return_value={"sub": "4"}
        ), patch(
            "middlewares.RequireAuth.getActiveRole", return_value="common"
        ), patch(
            "controllers.objectFound.updateObjectFound", return_value=result
        ) as update:
            response = self.client.patch(
                "/objects-found/12",
                headers={"Authorization": "Bearer signed-token"},
                data={
                    "id_category": "2",
                    "id_location": "3",
                    "found_date": "2026-01-15",
                    "color": "Azul",
                    "brand": "Marca",
                    "description": "Descrição atualizada",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(update.call_args.args[0:2], (12, 4))
        self.assertEqual(update.call_args.args[2]["id_category"], 2)


if __name__ == "__main__":
    unittest.main()
