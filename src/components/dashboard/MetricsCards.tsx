"use client";

interface Totals {
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  impressions: number;
  conversions: number;
  reach: number;
}

export function MetricsCards({ totals }: { totals: Totals | null }) {
  const cards = [
    {
      label: "Gasto Total",
      value: totals ? `€${totals.spend.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}` : "--",
      sub: "Ultimos 30 dias",
    },
    {
      label: "CTR Medio",
      value: totals ? `${totals.ctr}%` : "--",
      sub: "Click-through rate",
    },
    {
      label: "CPC Medio",
      value: totals ? `€${totals.cpc.toFixed(2)}` : "--",
      sub: "Custo por clique",
    },
    {
      label: "Conversoes",
      value: totals ? totals.conversions.toLocaleString("pt-PT") : "--",
      sub: "Total de conversoes",
    },
  ];

  const secondary = [
    {
      label: "ROAS",
      value: totals ? `${totals.roas}x` : "--",
    },
    {
      label: "Impressoes",
      value: totals ? totals.impressions.toLocaleString("pt-PT") : "--",
    },
    {
      label: "Alcance",
      value: totals ? totals.reach.toLocaleString("pt-PT") : "--",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
              {card.value}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {card.sub}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {secondary.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
            <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
