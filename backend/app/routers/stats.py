from fastapi import APIRouter, Query
from app.schemas.stats_schema import RepoStatsResponse
from app.services import github_service, analytics_service

router = APIRouter(prefix="/api/repos", tags=["stats"])


@router.get("/{owner}/{name}/stats", response_model=RepoStatsResponse)
async def get_repo_stats(
    owner: str,
    name: str,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=100, ge=1, le=100),
    search: str = "",
    sort: str = "recent",
):
    """Analytics are intentionally computed only from the currently loaded page.

    This keeps the app fast and avoids GitHub API rate limits on huge repos.
    Exact open/closed totals still use GitHub Search API.
    """
    counts = await github_service.fetch_issue_counts(owner, name)

    current_page = await github_service.fetch_repo_issues(
        owner,
        name,
        state="open",
        max_issues=per_page,
        page=page,
        search=search,
        sort=sort,
    )
    sample = current_page["issues"]

    return RepoStatsResponse(
        owner=owner,
        name=name,
        open_count=counts["open_count"],
        closed_count=counts["closed_count"],
        sample_size=len(sample),
        label_distribution=analytics_service.compute_label_distribution(sample),
        recent_activity=analytics_service.compute_recent_activity(sample),
        most_commented=analytics_service.compute_most_commented(sample),
    )
