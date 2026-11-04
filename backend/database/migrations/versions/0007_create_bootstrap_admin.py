"""create bootstrap administrator account

Revision ID: 0007_create_bootstrap_admin
Revises: 0006_pickup_disputes
Create Date: 2026-11-04
"""
import os
import re

from alembic import context, op
import sqlalchemy as sa
from werkzeug.security import generate_password_hash

revision = "0007_create_bootstrap_admin"
down_revision = "0006_pickup_disputes"
branch_labels = None
depends_on = None


def _requiredEnvironment(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(
            f"{name} must be configured in backend/.env before upgrading to head"
        )
    return value


def upgrade() -> None:
    if context.is_offline_mode():
        raise RuntimeError(
            "This data migration requires a live database connection; "
            "offline SQL generation is not supported."
        )

    name = _requiredEnvironment("BOOTSTRAP_ADMIN_NAME")
    email = _requiredEnvironment("BOOTSTRAP_ADMIN_EMAIL")
    cpf = _requiredEnvironment("BOOTSTRAP_ADMIN_CPF")
    phone = _requiredEnvironment("BOOTSTRAP_ADMIN_PHONE")
    password = _requiredEnvironment("BOOTSTRAP_ADMIN_PASSWORD")

    if len(name) > 150:
        raise RuntimeError("BOOTSTRAP_ADMIN_NAME must be at most 150 characters")
    if len(email) > 150 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise RuntimeError("BOOTSTRAP_ADMIN_EMAIL must be a valid email address")
    if not re.fullmatch(r"\d{11}", cpf):
        raise RuntimeError("BOOTSTRAP_ADMIN_CPF must contain exactly 11 digits")
    if not 8 <= len(phone) <= 20:
        raise RuntimeError("BOOTSTRAP_ADMIN_PHONE must contain 8 to 20 characters")
    if not 12 <= len(password) <= 128:
        raise RuntimeError(
            "BOOTSTRAP_ADMIN_PASSWORD must contain 12 to 128 characters"
        )

    connection = op.get_bind()
    existing_email = connection.execute(
        sa.text("SELECT id_user FROM `user` WHERE email = :email"),
        {"email": email},
    ).first()
    if existing_email:
        raise RuntimeError(
            "The bootstrap administrator email is already registered; "
            "choose a new BOOTSTRAP_ADMIN_EMAIL."
        )
    existing_cpf = connection.execute(
        sa.text("SELECT id_user FROM `user` WHERE cpf = :cpf"),
        {"cpf": cpf},
    ).first()
    if existing_cpf:
        raise RuntimeError(
            "The bootstrap administrator CPF is already registered; "
            "choose a new BOOTSTRAP_ADMIN_CPF."
        )

    admin_role_id = connection.execute(
        sa.text("SELECT id_role FROM role WHERE name = 'admin'")
    ).scalar_one_or_none()
    staff_profile_id = connection.execute(
        sa.text("SELECT id_profile FROM profile WHERE name = 'staff'")
    ).scalar_one_or_none()
    if admin_role_id is None or staff_profile_id is None:
        raise RuntimeError(
            "Required admin role or staff profile is missing; "
            "ensure the initial migrations have been applied."
        )

    connection.execute(
        sa.text(
            """
            INSERT INTO `user`
                (name, cpf, phone, email, rgm, password_hash, id_profile, role_id, is_active)
            VALUES
                (:name, :cpf, :phone, :email, NULL, :password_hash,
                 :id_profile, :role_id, TRUE)
            """
        ),
        {
            "name": name,
            "cpf": cpf,
            "phone": phone,
            "email": email,
            "password_hash": generate_password_hash(password),
            "id_profile": staff_profile_id,
            "role_id": admin_role_id,
        },
    )


def downgrade() -> None:
    if context.is_offline_mode():
        raise RuntimeError(
            "This data migration requires a live database connection; "
            "offline SQL generation is not supported."
        )

    email = _requiredEnvironment("BOOTSTRAP_ADMIN_EMAIL")
    connection = op.get_bind()
    user_id = connection.execute(
        sa.text(
            "SELECT id_user FROM `user` WHERE email = :email "
            "AND role_id = (SELECT id_role FROM role WHERE name = 'admin')"
        ),
        {"email": email},
    ).scalar_one_or_none()
    if user_id is None:
        return

    inspector = sa.inspect(connection)
    for table_name in inspector.get_table_names():
        if table_name == "user":
            continue
        for foreign_key in inspector.get_foreign_keys(table_name):
            if (
                foreign_key.get("referred_table") == "user"
                and foreign_key.get("referred_columns") == ["id_user"]
            ):
                column_name = foreign_key["constrained_columns"][0]
                quoted_table = connection.dialect.identifier_preparer.quote(
                    table_name
                )
                quoted_column = connection.dialect.identifier_preparer.quote(
                    column_name
                )
                reference_count = connection.execute(
                    sa.text(
                        f"SELECT COUNT(*) FROM {quoted_table} "
                        f"WHERE {quoted_column} = :user_id"
                    ),
                    {"user_id": user_id},
                ).scalar_one()
                if reference_count:
                    raise RuntimeError(
                        "Cannot remove the bootstrap administrator because "
                        "other records reference this account."
                    )

    connection.execute(
        sa.text("DELETE FROM `user` WHERE id_user = :user_id"),
        {"user_id": user_id},
    )
