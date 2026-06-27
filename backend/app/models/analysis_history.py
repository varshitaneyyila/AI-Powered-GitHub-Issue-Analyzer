from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, func
from app.database import Base


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)

    repo_owner = Column(String(255), nullable=False, index=True)
    repo_name = Column(String(255), nullable=False, index=True)
    issue_number = Column(Integer, nullable=False)
    issue_title = Column(Text, nullable=False)

    summary = Column(Text, nullable=False)
    key_problems = Column(JSON, nullable=False, default=list)
    important_comments = Column(JSON, nullable=False, default=list)
    suggested_next_steps = Column(JSON, nullable=False, default=list)

    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
