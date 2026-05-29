"""Add admin profile photo fields.

Revision ID: 202605220002
Revises: 202605220001
Create Date: 2026-05-22
"""

from alembic import op
import sqlalchemy as sa


revision = "202605220002"
down_revision = "202605220001"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("users")}

    if "avatar_path" not in columns:
        op.add_column("users", sa.Column("avatar_path", sa.String(length=500), nullable=True))
    if "avatar_cloudinary_public_id" not in columns:
        op.add_column("users", sa.Column("avatar_cloudinary_public_id", sa.String(length=500), nullable=True))
    if "avatar_cloudinary_resource_type" not in columns:
        op.add_column("users", sa.Column("avatar_cloudinary_resource_type", sa.String(length=50), nullable=True))


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("users")}

    if "avatar_cloudinary_resource_type" in columns:
        op.drop_column("users", "avatar_cloudinary_resource_type")
    if "avatar_cloudinary_public_id" in columns:
        op.drop_column("users", "avatar_cloudinary_public_id")
    if "avatar_path" in columns:
        op.drop_column("users", "avatar_path")
