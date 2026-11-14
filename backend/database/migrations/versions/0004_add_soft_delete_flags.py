"""add soft-delete flags

Revision ID: 0004_add_soft_delete_flags
Revises: 0003_add_item_review_metadata
Create Date: 2026-11-04
"""
from alembic import op
import sqlalchemy as sa

revision = "0004_add_soft_delete_flags"
down_revision = "0003_add_item_review_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "object_found",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("object_found", "is_active")
    op.drop_column("user", "is_active")
