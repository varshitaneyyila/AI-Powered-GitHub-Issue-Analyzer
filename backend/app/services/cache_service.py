import time
from typing import Optional

# Week 2 version: simple in-memory cache, keyed by "owner/repo#issue_number".
# Resets when the server restarts. Once Postgres is added (later week),
# this gets swapped for a DB-backed cache keyed the same way, with no
# changes needed in the router that calls it.

_CACHE: dict[str, tuple[float, dict]] = {}
TTL_SECONDS = 60 * 60 * 6  # 6 hours — issues/comments don't change that fast


def _make_key(owner: str, repo: str, issue_number: int) -> str:
    return f"{owner.lower()}/{repo.lower()}#{issue_number}"


def get(owner: str, repo: str, issue_number: int) -> Optional[dict]:
    key = _make_key(owner, repo, issue_number)
    entry = _CACHE.get(key)
    if entry is None:
        return None

    cached_at, value = entry
    if time.time() - cached_at > TTL_SECONDS:
        del _CACHE[key]  # expired, evict
        return None

    return value


def set(owner: str, repo: str, issue_number: int, value: dict) -> None:
    key = _make_key(owner, repo, issue_number)
    _CACHE[key] = (time.time(), value)


def invalidate(owner: str, repo: str, issue_number: int) -> None:
    key = _make_key(owner, repo, issue_number)
    _CACHE.pop(key, None)


def stats() -> dict:
    """Useful for a debug endpoint or just sanity-checking locally."""
    return {"cached_entries": len(_CACHE)}
