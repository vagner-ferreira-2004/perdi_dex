"""add pickup requests and property disputes

Revision ID: 0006_pickup_disputes
Revises: 0005_add_notifications
Create Date: 2026-11-04
"""
from alembic import op
import sqlalchemy as sa

revision = "0006_pickup_disputes"
down_revision = "0005_add_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pickup_request",
        sa.Column("id_pickup_request", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_object", sa.Integer(), nullable=False),
        sa.Column("id_user", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("requested_at", sa.DateTime(), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("review_reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["id_object"], ["object_found.id_object"]),
        sa.ForeignKeyConstraint(["id_user"], ["user.id_user"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["user.id_user"]),
        sa.PrimaryKeyConstraint("id_pickup_request"),
    )
    op.create_index(
        "ix_pickup_request_object_status",
        "pickup_request",
        ["id_object", "status"],
    )
    op.create_index(
        "ix_pickup_request_user_created",
        "pickup_request",
        ["id_user", "requested_at"],
    )
    op.create_table(
        "property_dispute",
        sa.Column("id_dispute", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_object", sa.Integer(), nullable=False),
        sa.Column("id_user", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("decision", sa.String(length=20), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["id_object"], ["object_found.id_object"]),
        sa.ForeignKeyConstraint(["id_user"], ["user.id_user"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["user.id_user"]),
        sa.PrimaryKeyConstraint("id_dispute"),
    )
    op.create_index(
        "ix_property_dispute_status_created",
        "property_dispute",
        ["status", "created_at"],
    )
    op.create_table(
        "dispute_evidence",
        sa.Column("id_evidence", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_dispute", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=500), nullable=False),
        sa.Column("public_id", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["id_dispute"], ["property_dispute.id_dispute"]),
        sa.PrimaryKeyConstraint("id_evidence"),
    )


def downgrade() -> None:
    op.drop_table("dispute_evidence")
    op.drop_index("ix_property_dispute_status_created", table_name="property_dispute")
    op.drop_table("property_dispute")
    op.drop_index("ix_pickup_request_user_created", table_name="pickup_request")
    op.drop_index("ix_pickup_request_object_status", table_name="pickup_request")
    op.drop_table("pickup_request")
