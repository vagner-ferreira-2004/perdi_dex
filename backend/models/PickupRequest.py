from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from .ObjectFound import ObjectFound


class PickupRequest(Base):
    __tablename__ = "pickup_request"

    id_pickup_request: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_object: Mapped[int] = mapped_column(ForeignKey("object_found.id_object"), nullable=False)
    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    requested_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("user.id_user"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    review_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    object_found: Mapped[ObjectFound] = relationship(foreign_keys=[id_object])
