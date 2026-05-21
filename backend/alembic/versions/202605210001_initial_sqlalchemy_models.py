"""Initial SQLAlchemy models.

Revision ID: 202605210001
Revises:
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa


revision = "202605210001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), server_default="student", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_is_active", "users", ["is_active"])
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "resources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("grade_level", sa.Integer(), nullable=False),
        sa.Column("subject", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("file_type", sa.String(length=50), nullable=False),
        sa.Column("file_path", sa.String(length=500), nullable=True),
        sa.Column("thumbnail_path", sa.String(length=500), nullable=True),
        sa.Column("original_filename", sa.String(length=255), nullable=True),
        sa.Column("external_url", sa.String(length=500), nullable=True),
        sa.Column("telegram_file_id", sa.String(length=200), nullable=True),
        sa.Column("cloudinary_public_id", sa.String(length=500), nullable=True),
        sa.Column("cloudinary_resource_type", sa.String(length=50), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_resources_category", "resources", ["category"])
    op.create_index("ix_resources_file_type", "resources", ["file_type"])
    op.create_index("ix_resources_grade_level", "resources", ["grade_level"])
    op.create_index("ix_resources_id", "resources", ["id"])
    op.create_index("ix_resources_is_published", "resources", ["is_published"])
    op.create_index("ix_resources_subject", "resources", ["subject"])

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="coming_soon", nullable=False),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("image_path", sa.String(length=500), nullable=True),
        sa.Column("media_path", sa.String(length=500), nullable=True),
        sa.Column("media_type", sa.String(length=50), server_default="video", nullable=False),
        sa.Column("cloudinary_public_id", sa.String(length=500), nullable=True),
        sa.Column("cloudinary_resource_type", sa.String(length=50), nullable=True),
        sa.Column("cta_label", sa.String(length=120), nullable=True),
        sa.Column("cta_url", sa.String(length=500), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_events_id", "events", ["id"])
    op.create_index("ix_events_is_published", "events", ["is_published"])
    op.create_index("ix_events_media_type", "events", ["media_type"])
    op.create_index("ix_events_status", "events", ["status"])


def downgrade():
    op.drop_index("ix_events_status", table_name="events")
    op.drop_index("ix_events_media_type", table_name="events")
    op.drop_index("ix_events_is_published", table_name="events")
    op.drop_index("ix_events_id", table_name="events")
    op.drop_table("events")

    op.drop_index("ix_resources_subject", table_name="resources")
    op.drop_index("ix_resources_is_published", table_name="resources")
    op.drop_index("ix_resources_id", table_name="resources")
    op.drop_index("ix_resources_grade_level", table_name="resources")
    op.drop_index("ix_resources_file_type", table_name="resources")
    op.drop_index("ix_resources_category", table_name="resources")
    op.drop_table("resources")

    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_is_active", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
