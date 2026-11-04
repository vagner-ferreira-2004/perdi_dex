import logging
from datetime import datetime, timezone

from database.database import Session
from errors import AuthorizationError, ConflictError, NotFoundError, ServiceError
from helpers.images import deleteImage, saveImage
from models import DisputeEvidence, ObjectFound, PickupRequest, PropertyDispute
from services.Notification import addNotification, notifyAdmins
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from services.ObjectFound.GetObjectFound import (
    getObjectFoundOrFail,
    serializePublicObjectFound,
    serializeObjectFoundDetail,
)

logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _serializeDispute(dispute: PropertyDispute) -> dict:
    item = serializeObjectFoundDetail(dispute.object_found)
    item.pop("id_user", None)
    return {
        "id_dispute": dispute.id_dispute,
        "id_object": dispute.id_object,
        "id_user": dispute.id_user,
        "description": dispute.description,
        "status": dispute.status,
        "decision": dispute.decision,
        "reason": dispute.reason,
        "created_at": dispute.created_at.isoformat(),
        "reviewed_at": dispute.reviewed_at.isoformat() if dispute.reviewed_at else None,
        "item": item,
        "evidence": [
            {"url": evidence.source}
            for evidence in dispute.evidences
        ],
    }


def createDispute(id_object: int, user_id: int, description: str, files) -> dict:
    if not isinstance(description, str) or not 20 <= len(description.strip()) <= 2000:
        raise ServiceError("description must contain between 20 and 2000 characters")
    evidence_files = [file for file in files if file and file.filename]
    if len(evidence_files) > 3:
        raise ServiceError("at most 3 evidence images are allowed")

    uploaded = []
    try:
        with Session.begin() as session:
            item = session.scalar(
                select(ObjectFound)
                .where(ObjectFound.id_object == id_object)
                .with_for_update()
            )
            if item is None or not item.is_active:
                raise NotFoundError("Item not found")
            if item.status != "Devolvido":
                raise ConflictError("Only returned items can be disputed")
            if item.id_user == user_id:
                raise AuthorizationError("You cannot dispute your own item")
            completed_pickup = session.scalar(
                select(PickupRequest.id_pickup_request).where(
                    PickupRequest.id_object == id_object,
                    PickupRequest.id_user == user_id,
                    PickupRequest.status == "Concluido",
                )
            )
            if completed_pickup:
                raise ConflictError("You cannot dispute an item you already received")
            existing = session.scalar(
                select(PropertyDispute.id_dispute).where(
                    PropertyDispute.id_object == id_object,
                    PropertyDispute.id_user == user_id,
                    PropertyDispute.status == "Pendente",
                )
            )
            if existing:
                raise ConflictError("You already have an open dispute for this item")

            dispute = PropertyDispute(
                id_object=id_object,
                id_user=user_id,
                description=description.strip(),
                status="Pendente",
                created_at=_now(),
            )
            session.add(dispute)
            session.flush()

            for file in evidence_files:
                asset = saveImage(file)
                uploaded.append(asset)
                session.add(
                    DisputeEvidence(
                        id_dispute=dispute.id_dispute,
                        source=asset["url"],
                        public_id=asset["public_id"],
                    )
                )
            notifyAdmins(
                session,
                "contestacao",
                "Nova contestação de propriedade",
                "Um usuário contestou a devolução de um item e enviou evidências.",
                id_object,
                "/pages/admin/contestacoes.html",
            )
            dispute.object_found = item
            session.flush()
            return _serializeDispute(dispute)
    except Exception:
        for asset in uploaded:
            try:
                deleteImage(asset["public_id"])
            except Exception:
                logger.exception(
                    "Failed to clean up Cloudinary evidence %s after dispute creation failed",
                    asset["public_id"],
                )
        raise


def listEligibleDisputeItems(user_id: int, page: int = 1, per_page: int = 20) -> dict:
    query = select(ObjectFound).where(
        ObjectFound.is_active.is_(True),
        ObjectFound.status == "Devolvido",
        ObjectFound.id_user != user_id,
        ~ObjectFound.id_object.in_(
            select(PickupRequest.id_object).where(
                PickupRequest.id_user == user_id,
                PickupRequest.status == "Concluido",
            )
        ),
        ~ObjectFound.id_object.in_(
            select(PropertyDispute.id_object).where(
                PropertyDispute.id_user == user_id,
                PropertyDispute.status == "Pendente",
            )
        ),
    )
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(query.subquery()))
        items = session.scalars(
            query.options(
                selectinload(ObjectFound.characteristic),
                selectinload(ObjectFound.photo),
                selectinload(ObjectFound.category),
                selectinload(ObjectFound.location),
            )
            .order_by(ObjectFound.found_date.desc(), ObjectFound.id_object.desc())
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [serializePublicObjectFound(item) for item in items],
            "page": page,
            "per_page": per_page,
            "total": total,
        }


def listUserDisputes(user_id: int, page: int = 1, per_page: int = 20) -> dict:
    base = select(PropertyDispute).where(PropertyDispute.id_user == user_id)
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(base.subquery()))
        disputes = session.scalars(
            base.options(
                selectinload(PropertyDispute.object_found).selectinload(
                    ObjectFound.characteristic
                ),
                selectinload(PropertyDispute.object_found).selectinload(ObjectFound.photo),
                selectinload(PropertyDispute.object_found).selectinload(ObjectFound.category),
                selectinload(PropertyDispute.object_found).selectinload(ObjectFound.location),
                selectinload(PropertyDispute.evidences),
            )
            .order_by(PropertyDispute.created_at.desc(), PropertyDispute.id_dispute.desc())
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [_serializeDispute(dispute) for dispute in disputes],
            "page": page,
            "per_page": per_page,
            "total": total,
        }


def listAdminDisputes(status: str = "Pendente", page: int = 1, per_page: int = 25) -> dict:
    base = select(PropertyDispute)
    if status:
        base = base.where(PropertyDispute.status == status)
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(base.subquery()))
        disputes = session.scalars(
            base.options(
                selectinload(PropertyDispute.object_found).selectinload(
                    ObjectFound.characteristic
                ),
                selectinload(PropertyDispute.object_found).selectinload(ObjectFound.photo),
                selectinload(PropertyDispute.object_found).selectinload(ObjectFound.category),
                selectinload(PropertyDispute.object_found).selectinload(ObjectFound.location),
                selectinload(PropertyDispute.evidences),
            )
            .order_by(PropertyDispute.created_at, PropertyDispute.id_dispute)
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [_serializeDispute(dispute) for dispute in disputes],
            "page": page,
            "per_page": per_page,
            "total": total,
        }


def reviewDispute(dispute_id: int, admin_id: int, data: dict) -> dict:
    decision = data.get("decision")
    reason = data.get("reason")
    if decision not in {"accept", "reject"}:
        raise ServiceError("decision must be accept or reject")
    if decision == "reject" and (not isinstance(reason, str) or not reason.strip()):
        raise ServiceError("reason is required when rejecting a dispute")

    with Session.begin() as session:
        dispute = session.scalar(
            select(PropertyDispute)
            .where(PropertyDispute.id_dispute == dispute_id)
            .with_for_update()
        )
        if dispute is None:
            raise NotFoundError("Dispute not found")
        if dispute.status != "Pendente":
            raise ConflictError("Only pending disputes can be reviewed")
        item = getObjectFoundOrFail(session, dispute.id_object)
        accepted = decision == "accept"
        dispute.status = "Resolvida"
        dispute.decision = "Aceita" if accepted else "Recusada"
        dispute.reason = reason.strip() if isinstance(reason, str) and reason.strip() else None
        dispute.reviewed_by = admin_id
        dispute.reviewed_at = _now()
        if accepted:
            item.status = "Encontrado"
        addNotification(
            session,
            dispute.id_user,
            "contestacao",
            "Contestação aceita" if accepted else "Contestação recusada",
            (
                "Sua contestação foi aceita e o item voltou ao catálogo."
                if accepted
                else f"Sua contestação foi recusada. Motivo: {dispute.reason}"
            ),
            item.id_object,
            "/pages/user/itens-sistema.html",
        )
        addNotification(
            session,
            item.id_user,
            "contestacao",
            "Decisão sobre contestação",
            (
                "A contestação do item foi aceita e ele voltou ao catálogo."
                if accepted
                else "A contestação do item foi recusada."
            ),
            item.id_object,
            "/pages/user/cadastro-item.html",
        )
        dispute.object_found = item
        session.flush()
        return _serializeDispute(dispute)
