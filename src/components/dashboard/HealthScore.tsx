"use client";

import { useState, useEffect } from "react";

interface CategoryScore {
  name: string;
  score: number;
  max: number;
  detail: string;
}

interface HealthData {
  score: number;
  grade: string;
  gradeColor: string;
  categories: CategoryScore[];
  summary: {
    totalSpend: number;
    avgCtr: number;
    avgRoas: number;
    totalConversions: number;
    activeCampaigns: number;
    totalCampaigns: number;
    platforms: number;
  };
}

export function HealthScore() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health-score")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const circumference = 2 * Math.PI * 54;
  const progress = (data.score / 100) * circumference;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
        Ads Health Score
      </h2>
      <p className="text-xs text-[var(--muted-foreground)] mb-6">
        Avaliação global das tuas campanhas nos últimos 30 dias
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Score Circle */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative w-[140px] h-[140px]">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="var(--border)"
                strokeWidth="10"
              />
              <circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke={data.gradeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${progress} ${circumference}`}
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-3xl font-extrabold"
                style={{ color: data.gradeColor }}
              >
                {data.grade}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {data.score}/100
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-center text-xs text-[var(--muted-foreground)]">
            <div>
              <div className="font-bold text-sm text-[var(--foreground)]">
                {data.summary.activeCampaigns}
              </div>
              Ativas
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--foreground)]">
                {data.summary.totalCampaigns}
              </div>
              Total
            </div>
            <div>
              <div className="font-bold text-sm text-[var(--foreground)]">
                {data.summary.platforms}
              </div>
              Plataformas
            </div>
          </div>
        </div>

        {/* Category Bars */}
        <div className="flex-1 w-full space-y-3">
          {data.categories.map((cat) => {
            const pct = cat.max > 0 ? (cat.score / cat.max) * 100 : 0;
            const barColor =
              pct >= 70
                ? "#22c55e"
                : pct >= 40
                  ? "#D97706"
                  : "#dc2626";
            return (
              <div key={cat.name}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {cat.name}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {cat.score}/{cat.max}
                  </span>
                </div>
                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  {cat.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
