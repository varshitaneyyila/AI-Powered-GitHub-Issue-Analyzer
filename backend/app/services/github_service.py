import httpx
from fastapi import HTTPException
from app.config import settings

GITHUB_API_BASE = "https://api.github.com"


def parse_repo_url(repo_url: str) -> tuple[str, str]:
    """
    Accepts URLs like:
      https://github.com/owner/name
      https://github.com/owner/name/
      github.com/owner/name
    Returns (owner, name)
    """
    cleaned = repo_url.strip().rstrip("/")
    cleaned = cleaned.replace("https://", "").replace("http://", "")
    cleaned = cleaned.replace("github.com/", "")
    parts = cleaned.split("/")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid GitHub repo URL. Expected format: https://github.com/owner/name")
    owner, name = parts[0], parts[1]
    return owner, name


def _headers() -> dict:
    headers = {"Accept": "application/vnd.github+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


async def fetch_repo_issues(
    owner: str,
    name: str,
    state: str = "open",
    max_issues: int = 100,
    page: int = 1,
    search: str = "",
    sort: str = "recent",
) -> dict:
    """
    Fetches one page of issues.

    - Uses GitHub Search API when title search is provided.
    - Uses GitHub Issues API otherwise.
    - Filters out pull requests because GitHub includes PRs in /issues.
    - Keeps per_page capped at 100 to avoid slow requests and rate limits.
    """
    per_page = max(1, min(max_issues, 100))
    page = max(1, page)

    if sort == "most_commented":
        github_sort = "comments"
        direction = "desc"
    elif sort == "oldest":
        github_sort = "created"
        direction = "asc"
    else:
        github_sort = "created"
        direction = "desc"

    search = (search or "").strip()

    if search:
        url = f"{GITHUB_API_BASE}/search/issues"
        # in:title makes the search focused on issue titles.
        params = {
            "q": f"repo:{owner}/{name} type:issue state:{state} in:title {search}",
            "per_page": per_page,
            "page": page,
            "sort": github_sort,
            "order": direction,
        }
    else:
        url = f"{GITHUB_API_BASE}/repos/{owner}/{name}/issues"
        params = {
            "state": state,
            "per_page": per_page,
            "page": page,
            "sort": github_sort,
            "direction": direction,
        }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Repository '{owner}/{name}' not found.")
    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded. Add a GITHUB_TOKEN to .env to raise the limit.")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch issues from GitHub.")

    data = response.json()
    if search:
        raw_issues = data.get("items", [])
        total_count = data.get("total_count", 0)
        has_next = page * per_page < total_count
    else:
        raw_issues = data
        total_count = None
        # GitHub does not include a count here, so a full page means there may be more.
        has_next = len(raw_issues) == per_page

    issues = []
    for item in raw_issues:
        if "pull_request" in item:
            continue
        issues.append({
            "id": item["id"],
            "number": item["number"],
            "title": item["title"],
            "body": item.get("body"),
            "state": item["state"],
            "labels": [label["name"] for label in item.get("labels", [])],
            "comments": item["comments"],
            "author": item["user"]["login"] if item.get("user") else None,
            "created_at": item["created_at"],
            "updated_at": item["updated_at"],
            "html_url": item["html_url"],
        })

    return {
        "issues": issues,
        "page": page,
        "per_page": per_page,
        "has_next": has_next,
        "has_previous": page > 1,
        "total_count": total_count,
    }


async def fetch_repo_metadata(owner: str, name: str) -> dict:
    url = f"{GITHUB_API_BASE}/repos/{owner}/{name}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=_headers())

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Repository '{owner}/{name}' not found.")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch repo metadata from GitHub.")

    data = response.json()
    return {
        "open_issues_count": data.get("open_issues_count", 0),
        "stars": data.get("stargazers_count", 0),
        "description": data.get("description"),
    }


async def fetch_issue_counts(owner: str, name: str) -> dict:
    """
    Uses GitHub's Search API to get exact open/closed issue totals (excluding PRs),
    rather than estimating from a single fetched page.
    """
    async def _count(state: str) -> int:
        url = f"{GITHUB_API_BASE}/search/issues"
        params = {"q": f"repo:{owner}/{name} type:issue state:{state}", "per_page": 1}
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=_headers(), params=params)
        if response.status_code != 200:
            return 0
        return response.json().get("total_count", 0)

    open_count = await _count("open")
    closed_count = await _count("closed")
    return {"open_count": open_count, "closed_count": closed_count}


async def fetch_issue(owner: str, name: str, issue_number: int) -> dict:
    """Fetch a single issue's title/body before AI analysis."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{name}/issues/{issue_number}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=_headers())

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Issue #{issue_number} not found in '{owner}/{name}'.")
    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded. Add a GITHUB_TOKEN to .env to raise the limit.")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch issue from GitHub.")

    data = response.json()
    return {
        "number": data["number"],
        "title": data["title"],
        "body": data.get("body") or "",
        "labels": [label["name"] for label in data.get("labels", [])],
        "html_url": data["html_url"],
    }


async def fetch_issue_comments(owner: str, name: str, issue_number: int, max_comments: int = 20) -> list[dict]:
    """Fetch up to max_comments comments for an issue, oldest first."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{name}/issues/{issue_number}/comments"
    params = {"per_page": max_comments}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=_headers(), params=params)

    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded. Add a GITHUB_TOKEN to .env to raise the limit.")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch issue comments from GitHub.")

    raw_comments = response.json()
    return [
        {
            "author": c["user"]["login"] if c.get("user") else "unknown",
            "body": c.get("body") or "",
            "created_at": c["created_at"],
        }
        for c in raw_comments
    ]
