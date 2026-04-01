"use client";

import { useState, useEffect, useCallback } from "react";
import { PlatformFilter } from "./PlatformFilter";
import { MetricsCards } from "./MetricsCards";
import { CampaignTable } from "./CampaignTable";
import { PerformanceChart } from "./PerformanceChart";
import { HealthScore } from "./HealthScore";
import { AIInsights } from "./AIInsights";

type Platform = "ALL" | "META" | "GOOGLE";

export function DashboardClient() {
  const [platform, setPlatform] = useState<Platform>("ALL");
  const [metrics, setMetrics] = useState<{
    totals: Record<string, number>;
    daily: Array<{ date: string; spend: number; clicks: number; impressions: number; conversions: number }>;
  } | null>(null);
  const [campaigns, setCampaigns] = useState<Array<{
    id: string;
    name: string;
    platform: "META" | "GOOGLE";
    status: string;
    objective: string;
    accountName: string;
    metrics: { spend: number; ctr: number; cpc: number; conversions: number; roas: number; impressions: number };
  }>>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, campaignsRes] = await Promise.all([
        fetch(`/api/metrics?platform=${platform}`),
        fetch(`/api/campaigns?platform=${platform}`),
      ]);

      if (metricsRes.ok) {
        setMetrics(await metricsRes.json());
      }
      if (campaignsRes.ok) {
        setCampaigns(await campaignsRes.json());
      }
    } catch {
      setError("Não foi possível carregar os dados. Verifica a tua ligação.");
    }
    setLoading(false);
  }, [platform]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      const synced = data.results?.filter((r: { status: string }) => r.status === "synced").length ?? 0;
      const errors = data.results?.filter((r: { status: string }) => r.status === "error").length ?? 0;
      if (errors > 0) {
        setError(`Sincronizado: ${synced} conta(s). Erros: ${errors} conta(s).`);
      }
      await fetchData();
    } catch {
      setError("Falha ao sincronizar. Tenta novamente.");
    }
    setSyncing(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Visão geral das tuas campanhas Meta e Google Ads
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {syncing ? "A sincronizar..." : "Sincronizar Dados"}
        </button>
      </div>

      <PlatformFilter selected={platform} onChange={setPlatform} />

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
          {/* Health Score + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <HealthScore />
            <AIInsights />
          </div>

          <MetricsCards
            totals={
              metrics?.totals
                ? {
                    spend: metrics.totals.spend ?? 0,
                    ctr: metrics.totals.ctr ?? 0,
                    cpc: metrics.totals.cpc ?? 0,
                    cpm: metrics.totals.cpm ?? 0,
                    roas: metrics.totals.roas ?? 0,
                    impressions: metrics.totals.impressions ?? 0,
                    conversions: metrics.totals.conversions ?? 0,
                    reach: metrics.totals.reach ?? 0,
                  }
                : null
            }
          />

          <div className="mb-8">
            <PerformanceChart data={metrics?.daily ?? []} />
          </div>

          <CampaignTable campaigns={campaigns} />
        </>
      )}
    </div>
  );
}
