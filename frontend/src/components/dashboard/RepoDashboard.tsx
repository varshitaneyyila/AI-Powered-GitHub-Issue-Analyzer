import { useEffect, useState } from "react";
import { fetchRepoStats, RepoStats } from "../../api/analytics";
import { IssueSort } from "../../api/repos";
import StatsCards from "./StatsCards";
import LabelDistributionChart from "../charts/LabelDistributionChart";
import ActivityChart from "../charts/ActivityChart";
import MostCommentedList from "./MostCommentedList";

interface Props {
  owner: string;
  name: string;
  page: number;
  perPage: number;
  search: string;
  sort: IssueSort;
}

export default function RepoDashboard({ owner, name, page, perPage, search, sort }: Props) {
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchRepoStats(owner, name, { page, perPage, search, sort })
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMessage(err?.response?.data?.detail || "Couldn't load repo analytics.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [owner, name, page, perPage, search, sort]);

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted animate-pulse">
        Crunching analytics for the currently loaded page…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
        {errorMessage}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <p className="font-mono text-xs text-muted">
        Charts below are based only on the currently loaded page ({stats.sample_size} issues).
        Open/closed totals above are exact.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-wide text-accent">
            Label Distribution
          </h3>
          <LabelDistributionChart data={stats.label_distribution} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-wide text-accent">
            Recent Activity (loaded page)
          </h3>
          <ActivityChart data={stats.recent_activity} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 font-mono text-xs uppercase tracking-wide text-accent">
          Most Commented Issues on This Page
        </h3>
        <MostCommentedList issues={stats.most_commented} />
      </div>
    </div>
  );
}
