from pydantic import BaseModel
from datetime import datetime


class FavoriteCreate(BaseModel):
    repo_owner: str
    repo_name: str


class FavoriteItem(BaseModel):
    id: int
    repo_owner: str
    repo_name: str
    created_at: datetime

    class Config:
        from_attributes = True
