from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base


class PropertyDispute(Base):
    __tablename__ = "property_dispute"

    id_dispute: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_object: Mapped[int] = mapped_column(ForeignKey("object_found.id_object"), nullable=False)
    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    decision: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("user.id_user"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    evidences: Mapped[list["DisputeEvidence"]] = relationship(
        back_populates="dispute", cascade="all, delete-orphan"
    )


class DisputeEvidence(Base):
    __tablename__ = "dispute_evidence"

    id_evidence: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_dispute: Mapped[int] = mapped_column(
        ForeignKey("property_dispute.id_dispute"), nullable=False
    )
    source: Mapped[str] = mapped_column(String(500), nullable=False)
    public_id: Mapped[str] = mapped_column(String(255), nullable=False)

    dispute: Mapped[PropertyDispute] = relationship(back_populates="evidences")
