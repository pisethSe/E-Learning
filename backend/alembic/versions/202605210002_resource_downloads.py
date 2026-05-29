"""Add resource download tracking.

Revision ID: 202605210002
Revises: 202605210001
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa


revision = "202605210002"
down_revision = "202605210001"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    resource_columns = {column["name"] for column in inspector.get_columns("resources")}

    if "thumbnail_cloudinary_public_id" not in resource_columns:
        op.add_column("resources", sa.Column("thumbnail_cloudinary_public_id", sa.String(length=500), nullable=True))
    if "thumbnail_cloudinary_resource_type" not in resource_columns:
        op.add_column("resources", sa.Column("thumbnail_cloudinary_resource_type", sa.String(length=50), nullable=True))

    if not inspector.has_table("resource_downloads"):
        op.create_table(
            "resource_downloads",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("resource_id", sa.Integer(), nullable=False),
            sa.Column("resource_title", sa.String(length=200), nullable=False),
            sa.Column("resource_grade_level", sa.Integer(), nullable=True),
            sa.Column("resource_subject", sa.String(length=100), nullable=True),
            sa.Column("resource_category", sa.String(length=100), nullable=True),
            sa.Column("resource_file_type", sa.String(length=50), nullable=True),
            sa.Column("target_url", sa.String(length=500), nullable=False),
            sa.Column("ip_address", sa.String(length=100), nullable=True),
            sa.Column("user_agent", sa.String(length=500), nullable=True),
            sa.Column("referrer", sa.String(length=500), nullable=True),
            sa.Column("downloaded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    existing_indexes = {
        index["name"]
        for index in inspector.get_indexes("resource_downloads")
    }
    indexes = [
        ("ix_resource_downloads_id", ["id"]),
        ("ix_resource_downloads_resource_id", ["resource_id"]),
        ("ix_resource_downloads_resource_grade_level", ["resource_grade_level"]),
        ("ix_resource_downloads_resource_subject", ["resource_subject"]),
        ("ix_resource_downloads_resource_category", ["resource_category"]),
        ("ix_resource_downloads_resource_file_type", ["resource_file_type"]),
        ("ix_resource_downloads_downloaded_at", ["downloaded_at"]),
    ]

    for index_name, columns in indexes:
        if index_name not in existing_indexes:
            op.create_index(index_name, "resource_downloads", columns)


def downgrade():
    op.drop_index("ix_resource_downloads_downloaded_at", table_name="resource_downloads")
    op.drop_index("ix_resource_downloads_resource_file_type", table_name="resource_downloads")
    op.drop_index("ix_resource_downloads_resource_category", table_name="resource_downloads")
    op.drop_index("ix_resource_downloads_resource_subject", table_name="resource_downloads")
    op.drop_index("ix_resource_downloads_resource_grade_level", table_name="resource_downloads")
    op.drop_index("ix_resource_downloads_resource_id", table_name="resource_downloads")
    op.drop_index("ix_resource_downloads_id", table_name="resource_downloads")
    op.drop_table("resource_downloads")

    op.drop_column("resources", "thumbnail_cloudinary_resource_type")
    op.drop_column("resources", "thumbnail_cloudinary_public_id")
