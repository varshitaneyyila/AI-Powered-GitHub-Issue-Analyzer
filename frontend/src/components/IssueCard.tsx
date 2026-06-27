import { Issue } from "../api/repos";

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export default function IssueCard({ issue, onAnalyze }: { issue: Issue; onAnalyze: (issue: Issue) => void }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 transition hover:border-accent">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onAnalyze(issue)}
          className="text-left font-medium text-gray-100 leading-snug hover:text-accent"
        >
          {issue.title}
        </button>
        <span className="shrink-0 font-mono text-xs text-muted">#{issue.number}</span>
      </div>

      {issue.body && (
        <p className="mt-2 line-clamp-2 text-sm text-muted">{issue.body}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {issue.labels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-gray-300"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
        <span>by {issue.author ?? "unknown"} · {timeAgo(issue.created_at)}</span>
        <div className="flex items-center gap-3">
          <span>{issue.comments} comments</span>
          <button onClick={() => onAnalyze(issue)} className="text-accent hover:underline">
            Analyze with AI
          </button>
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-100"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  );
}
