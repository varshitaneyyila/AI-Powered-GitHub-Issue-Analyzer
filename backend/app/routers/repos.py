from fastapi import APIRouter
from app.schemas.repo_schema import RepoRequest, RepoIssuesResponse
from app.services import github_service

router = APIRouter(prefix="/api/repos", tags=["repos"])


@router.post("/analyze", response_model=RepoIssuesResponse)
async def analyze_repo(payload: RepoRequest):
    owner, name = github_service.parse_repo_url(payload.repo_url)

    metadata = await github_service.fetch_repo_metadata(owner, name)
    issues_data = await github_service.fetch_repo_issues(
        owner,
        name,
        state="open",
        max_issues=payload.per_page,
        page=payload.page,
        search=payload.search,
        sort=payload.sort,
    )

    return RepoIssuesResponse(
        owner=owner,
        name=name,
        total_open_issues=metadata["open_issues_count"],
        issues=issues_data["issues"],
        page=issues_data["page"],
        per_page=issues_data["per_page"],
        has_next=issues_data["has_next"],
        has_previous=issues_data["has_previous"],
        search=payload.search,
        sort=payload.sort,
        analytics_note=f"Analytics are calculated from the currently loaded page of {len(issues_data['issues'])} issues.",
    )
