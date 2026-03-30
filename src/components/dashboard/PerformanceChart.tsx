"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyData {
  date: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export function PerformanceChart({ data }: { data: DailyData[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Performance ao Longo do Tempo
        </h2>
        <div className="h-64 flex items-center justify-center text-[var(--muted-foreground)]">
          <p className="text-sm">Sem dados para mostrar</p>
        </div>
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
    }),
    spend: Math.round(d.spend * 100) / 100,
  }));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
        Performance ao Longo do Tempo
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="spend"
              stroke="#1a73e8"
              strokeWidth={2}
              dot={false}
              name="Gasto (€)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="clicks"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Cliques"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversions"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Conversoes"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
