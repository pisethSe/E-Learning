"""Add resource file hash for duplicate detection.

Revision ID: 202605210003
Revises: 202605210002
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa


revision = "202605210003"
down_revision = "202605210002"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    resource_columns = {column["name"] for column in inspector.get_columns("resources")}

    if "file_hash" not in resource_columns:
        op.add_column("resources", sa.Column("file_hash", sa.String(length=64), nullable=True))

    existing_indexes = {index["name"] for index in inspector.get_indexes("resources")}
    if "ix_resources_file_hash" not in existing_indexes:
        op.create_index("ix_resources_file_hash", "resources", ["file_hash"])


def downgrade():
    op.drop_index("ix_resources_file_hash", table_name="resources")
    op.drop_column("resources", "file_hash")
