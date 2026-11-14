from typing import Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base


class Photo(Base):
    __tablename__ = "photo"

    id_photo: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_object: Mapped[int] = mapped_column(
        ForeignKey("object_found.id_object"), unique=True, nullable=False
    )
    source: Mapped[str] = mapped_column(String(500), nullable=False)
    public_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    object_found: Mapped["ObjectFound"] = relationship(back_populates="photo")
