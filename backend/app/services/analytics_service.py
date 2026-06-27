from collections import Counter
from datetime import datetime, timedelta, timezone


def compute_label_distribution(issues: list[dict]) -> list[dict]:
    """Counts how many issues have each label. Issues with no labels are skipped."""
    counter: Counter = Counter()
    for issue in issues:
        for label in issue.get("labels", []):
            counter[label] += 1

    return [
        {"label": label, "count": count}
        for label, count in sorted(counter.items(), key=lambda x: x[1], reverse=True)
    ]


def compute_recent_activity(issues: list[dict], days: int = 14) -> list[dict]:
    """
    Buckets issue creation dates into a daily count for the last `days` days.
    Returns a list ordered oldest -> newest, ready to feed straight into a chart.
    """
    today = datetime.now(timezone.utc).date()
    buckets = {today - timedelta(days=i): 0 for i in range(days)}

    for issue in issues:
        created_raw = issue.get("created_at")
        if not created_raw:
            continue
        created_date = datetime.fromisoformat(created_raw.replace("Z", "+00:00")).date()
        if created_date in buckets:
            buckets[created_date] += 1

    return [
        {"date": day.isoformat(), "count": count}
        for day, count in sorted(buckets.items())
    ]


def compute_most_commented(issues: list[dict], top_n: int = 5) -> list[dict]:
    """Returns the top_n issues sorted by comment count, descending."""
    sorted_issues = sorted(issues, key=lambda i: i.get("comments", 0), reverse=True)
    return [
        {
            "number": issue["number"],
            "title": issue["title"],
            "comments": issue["comments"],
            "html_url": issue["html_url"],
        }
        for issue in sorted_issues[:top_n]
        if issue.get("comments", 0) > 0
    ]
