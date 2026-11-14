"""add persistent notifications

Revision ID: 0005_add_notifications
Revises: 0004_add_soft_delete_flags
Create Date: 2026-11-04
"""
from alembic import op
import sqlalchemy as sa

revision = "0005_add_notifications"
down_revision = "0004_add_soft_delete_flags"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notification",
        sa.Column("id_notification", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_user", sa.Integer(), nullable=False),
        sa.Column("id_object", sa.Integer(), nullable=True),
        sa.Column("kind", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("link", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["id_object"], ["object_found.id_object"]),
        sa.ForeignKeyConstraint(["id_user"], ["user.id_user"]),
        sa.PrimaryKeyConstraint("id_notification"),
    )
    op.create_index(
        "ix_notification_user_created",
        "notification",
        ["id_user", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_notification_user_created", table_name="notification")
    op.drop_table("notification")
