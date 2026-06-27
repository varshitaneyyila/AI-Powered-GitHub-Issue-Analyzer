import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

ANALYSIS_PROMPT_TEMPLATE = """You are analyzing a GitHub issue to help contributors quickly understand it.

Issue Title: {title}

Issue Description:
{body}

Comments ({comment_count} total, most relevant shown below):
{comments}

Respond with ONLY a valid JSON object with exactly these keys:
{{
  "summary": "2-3 sentence plain-language summary",
  "key_problems": ["short bullet point", "short bullet point"],
  "important_comments": ["short useful insight from comments"],
  "suggested_next_steps": ["concrete next step"]
}}

Base everything only on the text provided. Do not invent details."""


def _fallback_analysis(title: str, reason: str, body: str = "", comments: list[dict] | None = None) -> dict:
    comments = comments or []
    short_body = (body or "").strip()[:250]

    return {
        "summary": (
            f"AI analysis is temporarily unavailable ({reason}). "
            f"This issue is titled: '{title}'. "
            f"{'Description preview: ' + short_body if short_body else 'No issue description was provided.'}"
        ),
        "key_problems": [
            f"Issue title suggests focus area: {title}",
            f"This issue has {len(comments)} comment(s) available for review.",
        ],
        "important_comments": [
            f"{c.get('author', 'unknown')}: {str(c.get('body', ''))[:120]}"
            for c in comments[:2]
        ] or ["No comments are available for fallback review."],
        "suggested_next_steps": [
            "Open the issue on GitHub and read the full description.",
            "Retry Analyze with AI later.",
        ],
    }


def _build_prompt(title: str, body: str, comments: list[dict]) -> str:
    comments_text = "\n".join(
        f"- {c.get('author', 'unknown')}: {str(c.get('body', ''))[:400]}"
        for c in comments[:5]
    ) if comments else "(no comments yet)"

    return ANALYSIS_PROMPT_TEMPLATE.format(
        title=title,
        body=(body[:1000] if body else "(no description provided)"),
        comment_count=len(comments),
        comments=comments_text[:2500],
    )


async def analyze_issue(title: str, body: str, comments: list[dict]) -> dict:
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is missing; using fallback analysis.")
        return _fallback_analysis(title, "missing Groq API key", body, comments)

    prompt = _build_prompt(title, body, comments)

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that outputs only valid JSON."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers=headers,
                json=payload,
            )
    except httpx.TimeoutException:
        logger.warning("Groq API timed out; using fallback analysis.")
        return _fallback_analysis(title, "Groq timed out", body, comments)
    except httpx.HTTPError as exc:
        logger.exception("Groq request failed: %s", exc)
        return _fallback_analysis(title, "Groq request failed", body, comments)

    if response.status_code != 200:
        logger.warning("Groq API returned %s: %s", response.status_code, response.text[:500])
        return _fallback_analysis(title, f"Groq error {response.status_code}", body, comments)

    try:
        data = response.json()
        raw_text = data["choices"][0]["message"]["content"]
        parsed = json.loads(raw_text)
    except Exception as exc:
        logger.exception("Could not parse Groq response: %s", exc)
        return _fallback_analysis(title, "Groq returned malformed JSON", body, comments)

    return {
        "summary": parsed.get("summary", ""),
        "key_problems": parsed.get("key_problems", []),
        "important_comments": parsed.get("important_comments", []),
        "suggested_next_steps": parsed.get("suggested_next_steps", []),
    }