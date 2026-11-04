from datetime import datetime, timezone

from database.database import Session
from errors import ConflictError, ServiceError
from models import ObjectFound
from services.Notification import addNotification

from services.ObjectFound.GetObjectFound import (
    getObjectFoundOrFail,
    serializeObjectFoundDetail,
)


def reviewObjectFound(id_object: int, admin_id: int, data: dict) -> dict:
    decision = data.get("decision")
    reason = data.get("reason")
    if decision not in {"approve", "reject"}:
        raise ServiceError("decision must be approve or reject")
    if decision == "reject" and (not isinstance(reason, str) or not reason.strip()):
        raise ServiceError("reason is required when rejecting an item")

    with Session.begin() as session:
        item = getObjectFoundOrFail(session, id_object)
        if item.status != "Pendente":
            raise ConflictError("Only pending items can be reviewed")
        item.status = "Encontrado" if decision == "approve" else "Reprovado"
        item.review_reason = reason.strip() if decision == "reject" else None
        item.reviewed_by = admin_id
        item.reviewed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        accepted = decision == "approve"
        addNotification(
            session,
            item.id_user,
            "aprovado" if accepted else "reprovado",
            "Item publicado" if accepted else "Item reprovado",
            (
                "Seu cadastro foi aprovado e publicado."
                if accepted
                else f"Seu cadastro foi reprovado. Motivo: {reason.strip()}"
            ),
            item.id_object,
            "/pages/user/cadastro-item.html",
        )
        session.flush()
        return serializeObjectFoundDetail(item)
