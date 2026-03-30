"use client";

import { useState } from "react";

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
    impressions: number;
  };
}

type SortKey = "name" | "spend" | "ctr" | "cpc" | "conversions" | "roas";

export function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...campaigns].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    if (sortBy === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else {
      aVal = a.metrics[sortBy];
      bVal = b.metrics[sortBy];
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-[var(--foreground)] select-none"
      onClick={() => handleSort(sortKey)}
    >
      {label} {sortBy === sortKey ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </th>
  );

  const platformBadge = (platform: "META" | "GOOGLE") =>
    platform === "META" ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <span className="w-3 h-3 rounded bg-blue-600 flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">f</span>
        </span>
        Meta
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <span className="w-3 h-3 rounded bg-red-500 flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">G</span>
        </span>
        Google
      </span>
    );

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      PAUSED: "bg-yellow-100 text-yellow-700",
      DRAFT: "bg-gray-100 text-gray-600",
      ENDED: "bg-gray-100 text-gray-500",
      ERROR: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? colors.DRAFT}`}
      >
        {status}
      </span>
    );
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Campanhas — Ranking de Performance
        </h2>
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p className="text-sm">Nenhuma campanha encontrada</p>
          <p className="text-xs mt-1">
            Vai a{" "}
            <a href="/settings" className="text-[var(--primary)] underline">
              Definicoes
            </a>{" "}
            para conectar as tuas contas Meta e Google Ads
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Campanhas — Ranking de Performance
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
              <th
                className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-[var(--foreground)]"
                onClick={() => handleSort("name")}
              >
                Campanha {sortBy === "name" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </th>
              <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Plataforma
              </th>
              <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <SortHeader label="Gasto" sortKey="spend" />
              <SortHeader label="CTR" sortKey="ctr" />
              <SortHeader label="CPC" sortKey="cpc" />
              <SortHeader label="Conv." sortKey="conversions" />
              <SortHeader label="ROAS" sortKey="roas" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b border-[var(--border)] hover:bg-[var(--accent)] transition-colors ${
                  i === 0 ? "bg-green-50/50" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {c.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {c.accountName}
                  </p>
                </td>
                <td className="px-6 py-4">{platformBadge(c.platform)}</td>
                <td className="px-6 py-4">{statusBadge(c.status)}</td>
                <td className="px-6 py-4 text-right text-sm text-[var(--foreground)]">
                  €{c.metrics.spend.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right text-sm text-[var(--foreground)]">
                  {c.metrics.ctr}%
                </td>
                <td className="px-6 py-4 text-right text-sm text-[var(--foreground)]">
                  €{c.metrics.cpc.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-[var(--foreground)]">
                  {c.metrics.conversions}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <span
                    className={
                      c.metrics.roas >= 3
                        ? "text-green-600"
                        : c.metrics.roas >= 1
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {c.metrics.roas}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
