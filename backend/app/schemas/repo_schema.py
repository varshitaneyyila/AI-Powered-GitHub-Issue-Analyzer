from pydantic import BaseModel, Field
from typing import Optional, Literal


class RepoRequest(BaseModel):
    repo_url: str  # e.g. https://github.com/facebook/react
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=100, ge=1, le=100)
    search: str = ""
    sort: Literal["recent", "most_commented", "oldest"] = "recent"


class IssueResponse(BaseModel):
    id: int
    number: int
    title: str
    body: Optional[str] = None
    state: str
    labels: list[str]
    comments: int
    author: Optional[str] = None
    created_at: str
    updated_at: str
    html_url: str


class RepoIssuesResponse(BaseModel):
    owner: str
    name: str
    total_open_issues: int
    issues: list[IssueResponse]
    page: int
    per_page: int
    has_next: bool
    has_previous: bool
    search: str = ""
    sort: str = "recent"
    analytics_note: str
