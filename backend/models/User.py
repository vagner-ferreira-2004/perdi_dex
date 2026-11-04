from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base

if TYPE_CHECKING:
    from .ObjectFound import ObjectFound
    from .Profile import Profile
    from .Role import Role


class User(Base):
    __tablename__ = "user"

    id_user: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    cpf: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    rgm: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    id_profile: Mapped[int] = mapped_column(
        ForeignKey("profile.id_profile"), nullable=False
    )
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id_role"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    objects_found: Mapped[list["ObjectFound"]] = relationship(
        back_populates="user", foreign_keys="ObjectFound.id_user"
    )
    profile: Mapped["Profile"] = relationship(back_populates="users")
    role: Mapped["Role"] = relationship(back_populates="users")
