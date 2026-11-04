"""add item review metadata

Revision ID: 0003_add_item_review_metadata
Revises: 0002_add_photo_public_id
Create Date: 2026-11-04
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_add_item_review_metadata"
down_revision = "0002_add_photo_public_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "object_found",
        sa.Column("review_reason", sa.Text(), nullable=True),
    )
    op.add_column(
        "object_found",
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_object_found_reviewed_by_user",
        "object_found",
        "user",
        ["reviewed_by"],
        ["id_user"],
    )
    op.add_column(
        "object_found",
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("object_found", "reviewed_at")
    op.drop_constraint(
        "fk_object_found_reviewed_by_user",
        "object_found",
        type_="foreignkey",
    )
    op.drop_column("object_found", "reviewed_by")
    op.drop_column("object_found", "review_reason")
