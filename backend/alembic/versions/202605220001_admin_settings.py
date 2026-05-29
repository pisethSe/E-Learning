"""Add persisted admin settings.

Revision ID: 202605220001
Revises: 202605210003
Create Date: 2026-05-22
"""

from alembic import op
import sqlalchemy as sa


revision = "202605220001"
down_revision = "202605210003"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("admin_settings"):
        boolean_default = "TRUE" if bind.dialect.name == "postgresql" else "1"
        false_default = "FALSE" if bind.dialect.name == "postgresql" else "0"

        op.create_table(
            "admin_settings",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("notifications_email", sa.Boolean(), server_default=sa.text(boolean_default), nullable=False),
            sa.Column("notifications_push", sa.Boolean(), server_default=sa.text(false_default), nullable=False),
            sa.Column("notifications_updates", sa.Boolean(), server_default=sa.text(boolean_default), nullable=False),
            sa.Column("appearance_theme", sa.String(length=20), server_default="light", nullable=False),
            sa.Column("appearance_density", sa.String(length=20), server_default="comfortable", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    existing_indexes = {index["name"] for index in inspector.get_indexes("admin_settings")}
    if "ix_admin_settings_id" not in existing_indexes:
        op.create_index("ix_admin_settings_id", "admin_settings", ["id"])
    if "ix_admin_settings_user_id" not in existing_indexes:
        op.create_index("ix_admin_settings_user_id", "admin_settings", ["user_id"], unique=True)


def downgrade():
    op.drop_index("ix_admin_settings_user_id", table_name="admin_settings")
    op.drop_index("ix_admin_settings_id", table_name="admin_settings")
    op.drop_table("admin_settings")
