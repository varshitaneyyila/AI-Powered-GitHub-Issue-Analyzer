import { useState } from "react";
import RepoSearchBar from "./components/RepoSearchBar";
import IssueCard from "./components/IssueCard";
import IssueAnalysisPanel from "./components/IssueAnalysisPanel";
import RepoDashboard from "./components/dashboard/RepoDashboard";
import FavoriteButton from "./components/FavoriteButton";
import IssueControls from "./components/IssueControls";
import HistoryPage from "./pages/HistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import { analyzeRepo, Issue, RepoIssuesResponse, IssueSort } from "./api/repos";

type Tab = "analyze" | "history" | "favorites";

export default function App() {
  const [tab, setTab] = useState<Tab>("analyze");
  const [repoUrl, setRepoUrl] = useState("");
  const [data, setData] = useState<RepoIssuesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<IssueSort>("recent");
  const perPage = 100;

  async function loadRepo(next: { repoUrl?: string; page?: number; search?: string; sort?: IssueSort } = {}) {
    const nextRepoUrl = next.repoUrl ?? repoUrl;
    const nextPage = next.page ?? page;
    const nextSearch = next.search ?? search;
    const nextSort = next.sort ?? sort;

    setLoading(true);
    setError(null);
    setSelectedIssue(null);
    try {
      const result = await analyzeRepo(nextRepoUrl, {
        page: nextPage,
        perPage,
        search: nextSearch,
        sort: nextSort,
      });
      setRepoUrl(nextRepoUrl);
      setPage(nextPage);
      setSearch(nextSearch);
      setSort(nextSort);
      setData(result);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || "Something went wrong fetching this repo. Check the URL and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(nextRepoUrl: string) {
    setData(null);
    await loadRepo({ repoUrl: nextRepoUrl, page: 1, search: "", sort: "recent" });
  }

  async function handleApplyFilters(nextSearch: string, nextSort: IssueSort) {
    await loadRepo({ page: 1, search: nextSearch, sort: nextSort });
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-12 text-gray-100">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex gap-4 font-mono text-sm">
          <button onClick={() => setTab("analyze")} className={tab === "analyze" ? "text-accent" : "text-muted hover:text-gray-100"}>
            Analyze
          </button>
          <button onClick={() => setTab("history")} className={tab === "history" ? "text-accent" : "text-muted hover:text-gray-100"}>
            History
          </button>
          <button onClick={() => setTab("favorites")} className={tab === "favorites" ? "text-accent" : "text-muted hover:text-gray-100"}>
            Favorites
          </button>
        </nav>

        {tab === "history" ? (
          <HistoryPage />
        ) : tab === "favorites" ? (
          <FavoritesPage />
        ) : (
          <>
            <header className="mb-8">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">repo intelligence</p>
              <h1 className="mt-1 text-3xl font-semibold">AI-Powered GitHub Issue Analyzer</h1>
              <p className="mt-2 text-muted">
                Analyze, prioritize and understand GitHub issues using AI.
              </p>
            </header>

            <RepoSearchBar onSubmit={handleSubmit} loading={loading} />

            {error && (
              <div className="mt-6 rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {data && (
              <div className="mt-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-sm text-muted">
                    {data.owner}/{data.name}
                  </h2>
                  <FavoriteButton owner={data.owner} name={data.name} />
                </div>

                <IssueControls search={search} sort={sort} loading={loading} onApply={handleApplyFilters} />

                <RepoDashboard owner={data.owner} name={data.name} page={page} perPage={perPage} search={search} sort={sort} />

                <div>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h2 className="font-mono text-sm text-muted">Open Issues</h2>
                      <p className="mt-1 font-mono text-xs text-muted">
                        Page {data.page} · showing up to {data.per_page} issues · {data.analytics_note}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-accent">
                      {data.total_open_issues} open issues total
                    </span>
                  </div>

                  {data.issues.length === 0 ? (
                    <p className="text-muted">No matching open issues found on this page/search.</p>
                  ) : (
                    <div className="grid gap-3">
                      {data.issues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} onAnalyze={setSelectedIssue} />
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-surface p-3 font-mono text-sm">
                    <button
                      onClick={() => loadRepo({ page: page - 1 })}
                      disabled={!data.has_previous || loading}
                      className="rounded-md border border-border px-3 py-2 text-muted hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-muted">Page {page}</span>
                    <button
                      onClick={() => loadRepo({ page: page + 1 })}
                      disabled={!data.has_next || loading}
                      className="rounded-md border border-border px-3 py-2 text-muted hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedIssue && data && (
              <IssueAnalysisPanel
                issue={selectedIssue}
                owner={data.owner}
                repo={data.name}
                onClose={() => setSelectedIssue(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
