import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ActivityPoint } from "../../api/analytics";

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const chartData = data.map((point) => ({ ...point, label: formatDay(point.date) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ left: -16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
        <XAxis dataKey="label" stroke="#8b949e" fontSize={12} />
        <YAxis stroke="#8b949e" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", fontSize: 12 }}
          labelStyle={{ color: "#e6edf3" }}
        />
        <Line type="monotone" dataKey="count" stroke="#3fb950" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
