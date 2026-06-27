"""create analysis_history and favorite_repos tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analysis_history",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("repo_owner", sa.String(length=255), nullable=False, index=True),
        sa.Column("repo_name", sa.String(length=255), nullable=False, index=True),
        sa.Column("issue_number", sa.Integer(), nullable=False),
        sa.Column("issue_title", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("key_problems", sa.JSON(), nullable=False),
        sa.Column("important_comments", sa.JSON(), nullable=False),
        sa.Column("suggested_next_steps", sa.JSON(), nullable=False),
        sa.Column("analyzed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
    )

    op.create_table(
        "favorite_repos",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("repo_owner", sa.String(length=255), nullable=False),
        sa.Column("repo_name", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("repo_owner", "repo_name", name="uq_favorite_repo"),
    )


def downgrade() -> None:
    op.drop_table("favorite_repos")
    op.drop_table("analysis_history")
