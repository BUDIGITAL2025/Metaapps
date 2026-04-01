"use client";

import { useState, useEffect } from "react";

interface Campaign {
  id: string;
  name: string;
  platform: "META" | "GOOGLE";
  status: string;
  objective: string;
  accountName: string;
  metrics: {
    spend: number;
    ctr: number;
    cpc: number;
    conversions: number;
    roas: number;
  };
}

export function CampaignListClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [platform, setPlatform] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/campaigns?platform=${platform}&status=${status}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCampaigns)
      .catch(() => {
        setError("Não foi possível carregar as campanhas.");
        return [];
      })
      .finally(() => setLoading(false));
  }, [platform, status]);

  const platformBadge = (p: "META" | "GOOGLE") =>
    p === "META" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        Meta
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Google
      </span>
    );

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      PAUSED: "bg-yellow-100 text-yellow-700",
      DRAFT: "bg-gray-100 text-gray-600",
      ENDED: "bg-gray-100 text-gray-500",
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] ?? "bg-gray-100 text-gray-600"}`}>
        {s}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Campanhas</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Todas as tuas campanhas Meta e Google Ads
          </p>
        </div>
        <a
          href="/campaigns/create"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
        >
          + Nova Campanha
        </a>
      </div>

      <div className="flex gap-2 mb-6">
        {["ALL", "META", "GOOGLE"].map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              platform === p
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
            }`}
          >
            {p === "ALL" ? "Todas" : p === "META" ? "Meta" : "Google"}
          </button>
        ))}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="ml-auto px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
        >
          <option value="ALL">Todas as status</option>
          <option value="ACTIVE">Ativas</option>
          <option value="PAUSED">Pausadas</option>
          <option value="DRAFT">Rascunho</option>
          <option value="ENDED">Terminadas</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <p className="text-sm">Nenhuma campanha encontrada</p>
            <p className="text-xs mt-1">
              Conecta as tuas contas em{" "}
              <a href="/settings" className="text-[var(--primary)] underline">Definições</a>{" "}
              ou{" "}
              <a href="/campaigns/create" className="text-[var(--primary)] underline">cria novas campanhas</a>
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">Campanha</th>
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">Plataforma</th>
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">Gasto</th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">CTR</th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">CPC</th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">Conv.</th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[var(--foreground)]">{c.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{c.objective}</p>
                  </td>
                  <td className="px-6 py-4">{platformBadge(c.platform)}</td>
                  <td className="px-6 py-4">{statusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-right text-sm">€{c.metrics.spend.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm">{c.metrics.ctr}%</td>
                  <td className="px-6 py-4 text-right text-sm">€{c.metrics.cpc.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm">{c.metrics.conversions}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <span className={c.metrics.roas >= 3 ? "text-green-600" : c.metrics.roas >= 1 ? "text-yellow-600" : "text-red-600"}>
                      {c.metrics.roas}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
