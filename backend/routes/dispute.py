from flask import Blueprint

from controllers.dispute import (
    createDisputeController,
    listEligibleDisputeItemsController,
    listAdminDisputesController,
    listUserDisputesController,
    reviewDisputeController,
)
from middlewares.RequireAuth import requireAuth, requireRole

dispute_bp = Blueprint("dispute", __name__)

dispute_bp.post("/objects-found/<int:id_object>/disputes")(
    requireAuth()(createDisputeController)
)
dispute_bp.get("/disputes/eligible-items")(
    requireAuth()(listEligibleDisputeItemsController)
)
dispute_bp.get("/disputes")(requireAuth()(listUserDisputesController))
dispute_bp.get("/admin/disputes")(
    requireAuth()(requireRole("admin")(listAdminDisputesController))
)
dispute_bp.patch("/admin/disputes/<int:id_dispute>/review")(
    requireAuth()(requireRole("admin")(reviewDisputeController))
)
