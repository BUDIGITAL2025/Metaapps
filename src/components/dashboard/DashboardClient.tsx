"use client";

import { useState, useEffect, useCallback } from "react";
import { PlatformFilter } from "./PlatformFilter";
import { MetricsCards } from "./MetricsCards";
import { CampaignTable } from "./CampaignTable";
import { PerformanceChart } from "./PerformanceChart";

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

  const fetchData = useCallback(async () => {
    setLoading(true);
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
      // API not available yet
    }
    setLoading(false);
  }, [platform]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSync() {
    setSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      await fetchData();
    } catch {
      // Sync failed
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
            Visao geral das tuas campanhas Meta e Google Ads
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[var(--muted-foreground)] text-sm">A carregar...</div>
        </div>
      ) : (
        <>
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
