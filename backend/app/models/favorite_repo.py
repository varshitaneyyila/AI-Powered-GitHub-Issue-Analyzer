from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint, func
from app.database import Base


class FavoriteRepo(Base):
    __tablename__ = "favorite_repos"
    __table_args__ = (UniqueConstraint("repo_owner", "repo_name", name="uq_favorite_repo"),)

    id = Column(Integer, primary_key=True, index=True)
    repo_owner = Column(String(255), nullable=False)
    repo_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
