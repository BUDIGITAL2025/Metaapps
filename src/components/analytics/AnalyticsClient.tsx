"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface PlatformMetrics {
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
}

interface MetricsResponse {
  totals: Record<string, number>;
  daily: Array<{ date: string; spend: number; clicks: number; impressions: number; conversions: number }>;
  byPlatform: {
    META: PlatformMetrics;
    GOOGLE: PlatformMetrics;
  };
}

export function AnalyticsClient() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/metrics?days=${days}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setError("Não foi possível carregar os dados de analytics."))
      .finally(() => setLoading(false));
  }, [days]);

  const meta = data?.byPlatform.META;
  const google = data?.byPlatform.GOOGLE;

  const comparisonData = [
    { metric: "Gasto (€)", Meta: meta?.spend ?? 0, Google: google?.spend ?? 0 },
    { metric: "CTR (%)", Meta: meta?.ctr ?? 0, Google: google?.ctr ?? 0 },
    { metric: "CPC (€)", Meta: meta?.cpc ?? 0, Google: google?.cpc ?? 0 },
    { metric: "ROAS", Meta: meta?.roas ?? 0, Google: google?.roas ?? 0 },
    { metric: "Conv.", Meta: meta?.conversions ?? 0, Google: google?.conversions ?? 0 },
  ];

  function PlatformCard({
    name,
    color,
    icon,
    metrics,
  }: {
    name: string;
    color: string;
    icon: string;
    metrics: PlatformMetrics | undefined;
  }) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="text-white font-bold">{icon}</span>
          </div>
          <h3 className="font-semibold text-[var(--foreground)]">{name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Gasto</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {metrics ? `€${metrics.spend.toFixed(2)}` : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">CTR</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {metrics ? `${metrics.ctr}%` : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">CPC</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {metrics ? `€${metrics.cpc.toFixed(2)}` : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">ROAS</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {metrics ? `${metrics.roas}x` : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Conversões</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {metrics ? metrics.conversions.toLocaleString("pt-PT") : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Impressões</p>
            <p className="text-lg font-bold text-[var(--foreground)]">
              {metrics ? metrics.impressions.toLocaleString("pt-PT") : "--"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Analytics
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Comparação de performance entre Meta e Google Ads
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={14}>Últimos 14 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={60}>Últimos 60 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
        </div>
      ) : (
      <>
      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PlatformCard name="Meta Ads" color="#1877F2" icon="f" metrics={meta} />
        <PlatformCard name="Google Ads" color="#EA4335" icon="G" metrics={google} />
      </div>

      {/* Comparison Bar Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Comparação Meta vs Google
        </h2>
        {data ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="metric"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Bar dataKey="Meta" fill="#1877F2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Google" fill="#EA4335" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-[var(--muted-foreground)]">
            <p className="text-sm">Conecta as tuas contas para ver comparação</p>
          </div>
        )}
      </div>

      {/* Trend Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Tendência de Gasto
        </h2>
        {data?.daily?.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.daily.map((d) => ({
                  ...d,
                  date: new Date(d.date).toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                  }),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
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
                  type="monotone"
                  dataKey="spend"
                  stroke="#1a73e8"
                  strokeWidth={2}
                  dot={false}
                  name="Gasto (€)"
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Conversões"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-[var(--muted-foreground)]">
            <p className="text-sm">Sem dados de tendência</p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
