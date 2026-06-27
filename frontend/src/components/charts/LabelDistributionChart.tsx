import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LabelCount } from "../../api/analytics";

export default function LabelDistributionChart({ data }: { data: LabelCount[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No labels found on the sampled issues.</p>;
  }

  const chartData = data.slice(0, 8); // keep it readable

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
        <XAxis type="number" stroke="#8b949e" fontSize={12} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="#8b949e"
          fontSize={12}
          width={120}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", fontSize: 12 }}
          labelStyle={{ color: "#e6edf3" }}
        />
        <Bar dataKey="count" fill="#3fb950" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
