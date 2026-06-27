from pydantic import BaseModel


class IssueAnalysisResponse(BaseModel):
    summary: str
    key_problems: list[str]
    important_comments: list[str]
    suggested_next_steps: list[str]
    cached: bool = False
