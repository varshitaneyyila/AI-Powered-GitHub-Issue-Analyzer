import { useEffect, useState } from "react";
import { Issue } from "../api/repos";
import { analyzeIssue, IssueAnalysis } from "../api/analysis";

interface Props {
  issue: Issue;
  owner: string;
  repo: string;
  onClose: () => void;
}

type Status = "loading" | "success" | "error";

export default function IssueAnalysisPanel({ issue, owner, repo, onClose }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [analysis, setAnalysis] = useState<IssueAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run(forceRefresh = false) {
      setStatus("loading");
      setErrorMessage("");
      try {
        const result = await analyzeIssue(owner, repo, issue.number, forceRefresh);
        if (!cancelled) {
          setAnalysis(result);
          setStatus("success");
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMessage(
            err?.response?.data?.detail || "Couldn't analyze this issue. Try again."
          );
          setStatus("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [owner, repo, issue.number]);

  async function handleForceRefresh() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await analyzeIssue(owner, repo, issue.number, true);
      setAnalysis(result);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || "Couldn't re-analyze this issue. Try again.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted">#{issue.number}</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-100">{issue.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md border border-border px-2 py-1 text-sm text-muted hover:text-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6">
          {status === "loading" && <LoadingState />}
          {status === "error" && (
            <div className="rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}
          {status === "success" && analysis && (
            <AnalysisResult analysis={analysis} onForceRefresh={handleForceRefresh} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-accent">Summary</p>
        <div className="mt-2 h-3 w-full rounded bg-border" />
        <div className="mt-2 h-3 w-5/6 rounded bg-border" />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-accent">Key Problems</p>
        <div className="mt-2 h-3 w-4/5 rounded bg-border" />
      </div>
      <p className="text-sm text-muted">Asking Gemini to read this issue…</p>
    </div>
  );
}

function AnalysisResult({
  analysis,
  onForceRefresh,
}: {
  analysis: IssueAnalysis;
  onForceRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {analysis.cached ? (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted">
            ⚡ cached result
          </span>
        ) : (
          <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-xs text-accent">
            freshly analyzed
          </span>
        )}
        <button
          onClick={onForceRefresh}
          className="font-mono text-xs text-muted hover:text-accent"
        >
          Re-analyze ↻
        </button>
      </div>

      <Section title="Summary">
        <p className="text-sm leading-relaxed text-gray-200">{analysis.summary}</p>
      </Section>

      <Section title="Key Problems">
        <BulletList items={analysis.key_problems} emptyText="No specific problems identified." />
      </Section>

      <Section title="Important Comments">
        <BulletList
          items={analysis.important_comments}
          emptyText="No comments stood out as particularly important."
        />
      </Section>

      <Section title="Suggested Next Steps">
        <BulletList items={analysis.suggested_next_steps} emptyText="No clear next step suggested." />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-accent">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function BulletList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-200">
          <span className="text-accent">›</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
