from datetime import datetime, timezone

from database.database import Session
from errors import NotFoundError
from models import Notification, Role, User
from sqlalchemy import func, select


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def addNotification(
    session,
    user_id: int,
    kind: str,
    title: str,
    body: str,
    id_object: int = None,
    link: str = None,
) -> None:
    session.add(
        Notification(
            id_user=user_id,
            id_object=id_object,
            kind=kind,
            title=title,
            body=body,
            link=link,
            created_at=_now(),
        )
    )


def notifyAdmins(session, kind: str, title: str, body: str, id_object: int, link: str):
    admin_ids = session.scalars(
        select(User.id_user)
        .join(Role, Role.id_role == User.role_id)
        .where(Role.name == "admin", User.is_active.is_(True))
    ).all()
    for admin_id in admin_ids:
        addNotification(session, admin_id, kind, title, body, id_object, link)


def listNotifications(user_id: int, page: int = 1, per_page: int = 20) -> dict:
    base = select(Notification).where(Notification.id_user == user_id)
    with Session() as session:
        total = session.scalar(select(func.count()).select_from(base.subquery()))
        unread = session.scalar(
            select(func.count()).select_from(
                select(Notification.id_notification)
                .where(
                    Notification.id_user == user_id,
                    Notification.read_at.is_(None),
                )
                .subquery()
            )
        )
        notifications = session.scalars(
            base.order_by(
                Notification.created_at.desc(), Notification.id_notification.desc()
            )
            .limit(per_page)
            .offset((page - 1) * per_page)
        ).all()
        return {
            "items": [
                {
                    "id_notification": item.id_notification,
                    "kind": item.kind,
                    "title": item.title,
                    "body": item.body,
                    "link": item.link,
                    "id_object": item.id_object,
                    "created_at": item.created_at.isoformat(),
                    "read_at": item.read_at.isoformat() if item.read_at else None,
                }
                for item in notifications
            ],
            "page": page,
            "per_page": per_page,
            "total": total,
            "unread": unread,
        }


def markNotificationRead(notification_id: int, user_id: int) -> None:
    with Session.begin() as session:
        item = session.scalar(
            select(Notification).where(
                Notification.id_notification == notification_id,
                Notification.id_user == user_id,
            )
        )
        if item is None:
            raise NotFoundError("Notification not found")
        if item.read_at is None:
            item.read_at = _now()


def markNotificationUnread(notification_id: int, user_id: int) -> None:
    with Session.begin() as session:
        item = session.scalar(
            select(Notification).where(
                Notification.id_notification == notification_id,
                Notification.id_user == user_id,
            )
        )
        if item is None:
            raise NotFoundError("Notification not found")
        item.read_at = None


def markAllNotificationsRead(user_id: int) -> int:
    from sqlalchemy import update

    with Session.begin() as session:
        result = session.execute(
            update(Notification)
            .where(
                Notification.id_user == user_id,
                Notification.read_at.is_(None),
            )
            .values(read_at=_now())
        )
        return result.rowcount or 0


def deleteNotification(notification_id: int, user_id: int) -> None:
    with Session.begin() as session:
        item = session.scalar(
            select(Notification).where(
                Notification.id_notification == notification_id,
                Notification.id_user == user_id,
            )
        )
        if item is None:
            raise NotFoundError("Notification not found")
        session.delete(item)
