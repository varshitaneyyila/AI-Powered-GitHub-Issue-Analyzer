from pydantic import BaseModel
from datetime import datetime


class AnalysisHistoryItem(BaseModel):
    id: int
    repo_owner: str
    repo_name: str
    issue_number: int
    issue_title: str
    summary: str
    key_problems: list[str]
    important_comments: list[str]
    suggested_next_steps: list[str]
    analyzed_at: datetime

    class Config:
        from_attributes = True


class AnalysisHistoryListResponse(BaseModel):
    total: int
    items: list[AnalysisHistoryItem]
