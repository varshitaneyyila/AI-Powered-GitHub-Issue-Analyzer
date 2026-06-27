import { CommentedIssue } from "../../api/analytics";

export default function MostCommentedList({ issues }: { issues: CommentedIssue[] }) {
  if (issues.length === 0) {
    return <p className="text-sm text-muted">No commented issues in the sampled set.</p>;
  }

  return (
    <ul className="space-y-2">
      {issues.map((issue) => (
        <li key={issue.number}>
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-canvas px-3 py-2 text-sm hover:border-accent"
          >
            <span className="truncate text-gray-200">
              <span className="mr-2 font-mono text-xs text-muted">#{issue.number}</span>
              {issue.title}
            </span>
            <span className="shrink-0 font-mono text-xs text-accent">{issue.comments} 💬</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
