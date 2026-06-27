from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.analysis_history import AnalysisHistory
from app.schemas.history_schema import AnalysisHistoryListResponse, AnalysisHistoryItem

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=AnalysisHistoryListResponse)
def get_history(
    q: str | None = Query(default=None, description="Search by repo name, owner, or issue title"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Returns past AI analyses, newest first. Optional `q` searches across
    repo owner, repo name, and issue title (case-insensitive, partial match).
    """
    query = db.query(AnalysisHistory)

    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                AnalysisHistory.repo_owner.ilike(pattern),
                AnalysisHistory.repo_name.ilike(pattern),
                AnalysisHistory.issue_title.ilike(pattern),
            )
        )

    total = query.count()

    items = (
        query.order_by(AnalysisHistory.analyzed_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return AnalysisHistoryListResponse(
        total=total,
        items=[AnalysisHistoryItem.model_validate(item) for item in items],
    )
