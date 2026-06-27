from app.services import ai_service
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.analysis_history import AnalysisHistory
from app.schemas.analysis_schema import IssueAnalysisResponse
from app.services import github_service, cache_service

router = APIRouter(prefix="/api/issues", tags=["analysis"])


@router.get("/{owner}/{repo}/{issue_number}/analyze", response_model=IssueAnalysisResponse)
async def analyze_issue(
    owner: str,
    repo: str,
    issue_number: int,
    force_refresh: bool = False,
    db: Session = Depends(get_db),
):
    """
    Fetches a single issue + its comments from GitHub, then sends them to
    Gemini for summary/key-problems/important-comments/next-steps.

    Cached in memory for TTL_SECONDS so re-opening the same issue doesn't
    re-call Gemini. Pass ?force_refresh=true to bypass the cache.

    Every FRESH analysis (cache miss or forced refresh) is also persisted
    to the analysis_history table, so it shows up in the History page even
    after the in-memory cache expires or the server restarts.
    """
    if not force_refresh:
        cached = cache_service.get(owner, repo, issue_number)
        if cached is not None:
            return IssueAnalysisResponse(**cached, cached=True)

    issue = await github_service.fetch_issue(owner, repo, issue_number)
    comments = await github_service.fetch_issue_comments(owner, repo, issue_number)

    analysis = await ai_service.analyze_issue(
        title=issue["title"],
        body=issue["body"],
        comments=comments,
    )

    cache_service.set(owner, repo, issue_number, analysis)

    history_row = AnalysisHistory(
        repo_owner=owner,
        repo_name=repo,
        issue_number=issue_number,
        issue_title=issue["title"],
        summary=analysis["summary"],
        key_problems=analysis["key_problems"],
        important_comments=analysis["important_comments"],
        suggested_next_steps=analysis["suggested_next_steps"],
    )
    db.add(history_row)
    db.commit()

    return IssueAnalysisResponse(**analysis, cached=False)


@router.get("/cache/stats")
async def cache_stats():
    """Quick way to confirm caching is working while developing locally."""
    return cache_service.stats()
