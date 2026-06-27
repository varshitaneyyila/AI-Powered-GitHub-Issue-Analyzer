from pydantic import BaseModel


class LabelCount(BaseModel):
    label: str
    count: int


class ActivityPoint(BaseModel):
    date: str
    count: int


class CommentedIssue(BaseModel):
    number: int
    title: str
    comments: int
    html_url: str


class RepoStatsResponse(BaseModel):
    owner: str
    name: str
    open_count: int
    closed_count: int
    sample_size: int          # how many issues the charts below are computed from
    label_distribution: list[LabelCount]
    recent_activity: list[ActivityPoint]
    most_commented: list[CommentedIssue]
