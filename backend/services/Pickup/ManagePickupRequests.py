from datetime import datetime, timezone

from database.database import Session
from errors import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ServiceError,
)
from helpers.HashPassword import verifyPassword
from models import ObjectFound, PickupRequest, User
from services.Notification import addNotification, notifyAdmins
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from services.ObjectFound.GetObjectFound import (
    getObjectFoundOrFail,
    serializeObjectFoundDetail,
)

PENDING = "Pendente"
APPROVED = "Aprovado"
REJECTED = "Reprovado"
CANCELLED = "Cancelado"
COMPLETED = "Concluido"
ACTIVE_STATUSES = {PENDING, APPROVED}


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _serializePickupRequest(item: PickupRequest, include_requester=False) -> dict:
    found_item = serializeObjectFoundDetail(item.object_found)
    found_item.pop("id_user", None)
    result = {
        "id_pickup_request": item.id_pickup_request,
        "id_object": item.id_object,
        "status": item.status,
        "requested_at": item.requested_at.isoformat(),
        "reviewed_at": item.reviewed_at.isoformat() if item.reviewed_at else None,
        "completed_at": item.completed_at.isoformat() if item.completed_at else None,
        "review_reason": item.review_reason,
        "item": found_item,
    }
    if include_requester:
        result["id_user"] = item.id_user
    return result


def createPickupRequest(id_object: int, user_id: int) -> dict:
    with Session.begin() as session:
        item = session.scalar(
            select(ObjectFound)
            .where(ObjectFound.id_object == id_object)
            .with_for_update()
        )
        if item is None or not item.is_active:
            raise NotFoundError("Published item not found")
        if item.status != "Encontrado":
            raise ConflictError("Only published items can receive pickup requests")
        if item.id_user == user_id:
            raise AuthorizationError("You cannot request your own item")
        active = session.scalar(
            select(PickupRequest.id_pickup_request)
            .where(
                PickupRequest.id_object == id_object,
                PickupRequest.status.in_(ACTIVE_STATUSES),
            )
            .with_for_update()
        )
        if active:
            raise ConflictError("This item already has an active pickup request")

        request = PickupRequest(
            id_object=id_object,
            id_user=user_id,
            status=PENDING,
            requested_at=_now(),
        )
        session.add(request)
        session.flush()
        notifyAdmins(
            session,
            "solicitacao",
            "Novo pedido de resgate",
            "Um usuário solicitou o resgate de um item publicado.",
            id_object,
            "/pages/admin/solicitacoes.html",
        )
        addNotification(
            session,
            item.id_user,
            "solicitacao",
            "Pedido de resgate recebido",
            "Um usuário solicitou o resgate do item que você cadastrou.",
            id_object,
            "/pages/user/cadastro-item.html",
        )
        request.object_found = item
        return _serializePickupRequest(request)


def listUserPickupRequests(
    user_id: int, page: int = 1, per_page: int = 20, status: str = None
) -> dict:
    base = select(PickupRequest).where(PickupRequest.id_user == user_id)
    if status:
        base = base.where(PickupRequest.status == status)
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(base.subquery()))
        requests = session.scalars(
            base.options(
                selectinload(PickupRequest.object_found).selectinload(
                    ObjectFound.characteristic
                ),
                selectinload(PickupRequest.object_found).selectinload(ObjectFound.photo),
                selectinload(PickupRequest.object_found).selectinload(ObjectFound.category),
                selectinload(PickupRequest.object_found).selectinload(ObjectFound.location),
            )
            .order_by(PickupRequest.requested_at.desc(), PickupRequest.id_pickup_request.desc())
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [_serializePickupRequest(item) for item in requests],
            "page": page,
            "per_page": per_page,
            "total": total,
        }


def listAdminPickupRequests(
    status: str = None, page: int = 1, per_page: int = 25
) -> dict:
    base = select(PickupRequest)
    if status:
        base = base.where(PickupRequest.status == status)
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(base.subquery()))
        requests = session.scalars(
            base.options(
                selectinload(PickupRequest.object_found).selectinload(
                    ObjectFound.characteristic
                ),
                selectinload(PickupRequest.object_found).selectinload(ObjectFound.photo),
                selectinload(PickupRequest.object_found).selectinload(ObjectFound.category),
                selectinload(PickupRequest.object_found).selectinload(ObjectFound.location),
            )
            .order_by(PickupRequest.requested_at, PickupRequest.id_pickup_request)
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [
                _serializePickupRequest(item, include_requester=True)
                for item in requests
            ],
            "page": page,
            "per_page": per_page,
            "total": total,
        }


def cancelPickupRequest(request_id: int, user_id: int) -> None:
    with Session.begin() as session:
        request = session.get(PickupRequest, request_id)
        if request is None:
            raise NotFoundError("Pickup request not found")
        if request.id_user != user_id:
            raise AuthorizationError("You cannot cancel this pickup request")
        if request.status != PENDING:
            raise ConflictError("Only pending requests can be cancelled")
        request.status = CANCELLED
        request.reviewed_at = _now()


def reviewPickupRequest(
    request_id: int, admin_id: int, data: dict
) -> dict:
    decision = data.get("decision")
    reason = data.get("reason")
    if decision not in {"approve", "reject"}:
        raise ServiceError("decision must be approve or reject")
    if decision == "reject" and (not isinstance(reason, str) or not reason.strip()):
        raise ServiceError("reason is required when rejecting a request")

    with Session.begin() as session:
        target = session.get(PickupRequest, request_id)
        if target is None:
            raise NotFoundError("Pickup request not found")
        item = session.scalar(
            select(ObjectFound)
            .where(ObjectFound.id_object == target.id_object)
            .with_for_update()
        )
        if item is None or not item.is_active:
            raise NotFoundError("Item not found")
        active_requests = session.scalars(
            select(PickupRequest)
            .where(
                PickupRequest.id_object == target.id_object,
                PickupRequest.status.in_(ACTIVE_STATUSES),
            )
            .order_by(PickupRequest.id_pickup_request)
            .with_for_update()
        ).all()
        request = next(
            (
                pending
                for pending in active_requests
                if pending.id_pickup_request == request_id
            ),
            None,
        )
        if request is None:
            raise ConflictError("Only pending requests can be reviewed")
        if request.status != PENDING:
            raise ConflictError("Only pending requests can be reviewed")
        if item.status != "Encontrado":
            raise ConflictError("Only published items can be approved for pickup")

        accepted = decision == "approve"
        request.status = APPROVED if accepted else REJECTED
        request.reviewed_by = admin_id
        request.reviewed_at = _now()
        request.review_reason = None if accepted else reason.strip()
        if accepted:
            other_requests = session.scalars(
                select(PickupRequest)
                .where(
                    PickupRequest.id_object == request.id_object,
                    PickupRequest.id_pickup_request != request_id,
                    PickupRequest.status == PENDING,
                )
                .with_for_update()
            ).all()
            for other in other_requests:
                other.status = REJECTED
                other.reviewed_by = admin_id
                other.reviewed_at = request.reviewed_at
                other.review_reason = "Another pickup request was approved"
                addNotification(
                    session,
                    other.id_user,
                    "solicitacao",
                    "Pedido de resgate não aprovado",
                    "Outro pedido para este item foi aprovado.",
                    item.id_object,
                    "/pages/user/cadastro-item.html",
                )

        addNotification(
            session,
            request.id_user,
            "solicitacao",
            "Pedido de resgate aprovado" if accepted else "Pedido de resgate recusado",
            (
                "Seu pedido foi aprovado. Confirme a retirada na área de itens."
                if accepted
                else f"Seu pedido foi recusado. Motivo: {reason.strip()}"
            ),
            item.id_object,
            "/pages/user/cadastro-item.html",
        )
        addNotification(
            session,
            item.id_user,
            "solicitacao",
            "Decisão sobre pedido de resgate",
            (
                "Um pedido de resgate do seu item foi aprovado."
                if accepted
                else "Um pedido de resgate do seu item foi recusado."
            ),
            item.id_object,
            "/pages/user/cadastro-item.html",
        )
        request.object_found = item
        return _serializePickupRequest(request, include_requester=True)


def confirmPickup(request_id: int, user_id: int, data: dict) -> dict:
    password = data.get("current_password")
    if not isinstance(password, str) or not password:
        raise ServiceError("current_password is required")
    with Session.begin() as session:
        object_id = session.scalar(
            select(PickupRequest.id_object).where(
                PickupRequest.id_pickup_request == request_id
            )
        )
        if object_id is None:
            raise NotFoundError("Pickup request not found")
        item = session.scalar(
            select(ObjectFound)
            .where(ObjectFound.id_object == object_id)
            .with_for_update()
        )
        if item is None or not item.is_active:
            raise NotFoundError("Item not found")
        request = session.scalar(
            select(PickupRequest)
            .where(PickupRequest.id_pickup_request == request_id)
            .with_for_update()
        )
        if request is None:
            raise NotFoundError("Pickup request not found")
        if request.id_object != object_id:
            raise ConflictError("Pickup request item changed; retry the operation")
        if request.id_user != user_id:
            raise AuthorizationError("You cannot confirm this pickup")
        if request.status != APPROVED:
            raise ConflictError("Only approved requests can be confirmed")
        user = session.get(User, user_id)
        if user is None or not verifyPassword(password, user.password_hash):
            raise AuthenticationError("Current password is invalid")
        if item.status != "Encontrado":
            raise ConflictError("Item is no longer available for pickup")
        request.status = COMPLETED
        request.completed_at = _now()
        item.status = "Devolvido"
        addNotification(
            session,
            item.id_user,
            "devolvido",
            "Item devolvido",
            "O pedido de resgate foi confirmado e o item foi marcado como devolvido.",
            item.id_object,
            "/pages/user/cadastro-item.html",
        )
        request.object_found = item
        return _serializePickupRequest(request)
