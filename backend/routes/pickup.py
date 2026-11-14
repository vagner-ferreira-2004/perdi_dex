from flask import Blueprint

from controllers.pickup import (
    cancelPickupRequestController,
    confirmPickupController,
    createPickupRequestController,
    listAdminPickupRequestsController,
    listUserPickupRequestsController,
    reviewPickupRequestController,
)
from middlewares.RequireAuth import requireAuth, requireRole

pickup_bp = Blueprint("pickup", __name__)

pickup_bp.post("/objects-found/<int:id_object>/pickup-requests")(
    requireAuth()(createPickupRequestController)
)
pickup_bp.get("/pickup-requests")(requireAuth()(listUserPickupRequestsController))
pickup_bp.delete("/pickup-requests/<int:id_request>")(
    requireAuth()(cancelPickupRequestController)
)
pickup_bp.post("/pickup-requests/<int:id_request>/confirm")(
    requireAuth()(confirmPickupController)
)
pickup_bp.get("/admin/pickup-requests")(
    requireAuth()(requireRole("admin")(listAdminPickupRequestsController))
)
pickup_bp.patch("/admin/pickup-requests/<int:id_request>/review")(
    requireAuth()(requireRole("admin")(reviewPickupRequestController))
)
