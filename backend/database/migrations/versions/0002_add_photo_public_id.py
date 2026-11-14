"""store Cloudinary public id for uploaded item photos

Revision ID: 0002_add_photo_public_id
Revises: 0001_create_initial_tables
Create Date: 2026-11-04
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_add_photo_public_id"
down_revision = "0001_create_initial_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "photo",
        sa.Column("public_id", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("photo", "public_id")
