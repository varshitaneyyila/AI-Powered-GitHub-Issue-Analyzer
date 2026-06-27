import { useEffect, useState } from "react";
import { fetchHistory, AnalysisHistoryItem } from "../api/history";

function formatDate(dateStr: string): string {
  const normalized = dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`;

  return new Date(normalized).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    const timeout = setTimeout(() => {
      fetchHistory(query)
        .then((data) => {
          if (!cancelled) {
            setItems(data.items);
            setTotal(data.total);
            setStatus("success");
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setErrorMessage(err?.response?.data?.detail || "Couldn't load history.");
            setStatus("error");
          }
        });
    }, 300); // debounce search input

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">history</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-100">Analysis History</h1>
        <p className="mt-1 text-muted">Every AI analysis you've run, searchable anytime.</p>
      </header>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by repo owner, repo name, or issue title…"
        className="w-full rounded-md border border-border bg-surface px-4 py-3 font-mono text-sm text-gray-200 placeholder-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />

      {status === "loading" && <p className="mt-6 text-sm text-muted">Loading…</p>}

      {status === "error" && (
        <div className="mt-6 rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {status === "success" && (
        <>
          <p className="mt-4 font-mono text-xs text-muted">{total} total result{total !== 1 && "s"}</p>

          {items.length === 0 ? (
            <p className="mt-4 text-muted">No analyses found{query && " for that search"}.</p>
          ) : (
            <div className="mt-3 grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-accent">
                        {item.repo_owner}/{item.repo_name} · #{item.issue_number}
                      </p>
                      <h3 className="mt-1 font-medium text-gray-100">{item.issue_title}</h3>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {formatDate(item.analyzed_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">{item.summary}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
