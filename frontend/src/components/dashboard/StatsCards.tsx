import { RepoStats } from "../../api/analytics";

export default function StatsCards({ stats }: { stats: RepoStats }) {
  const cards = [
    { label: "Open Issues", value: stats.open_count },
    { label: "Closed Issues", value: stats.closed_count },
    {
      label: "Most Active Label",
      value: stats.label_distribution[0]?.label ?? "—",
      isText: true,
    },
    {
      label: "Top Commented",
      value: stats.most_commented[0] ? `${stats.most_commented[0].comments} comments` : "—",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-surface p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">{card.label}</p>
          <p
            className={
              card.isText
                ? "mt-1 truncate text-lg font-semibold text-gray-100"
                : "mt-1 text-2xl font-semibold text-accent"
            }
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
