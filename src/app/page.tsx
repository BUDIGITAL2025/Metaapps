export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Visao geral das tuas campanhas Meta e Google Ads
        </p>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
          Todas
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]">
          Meta Ads
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]">
          Google Ads
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Gasto Total</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Conecta as tuas contas para ver dados</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">CTR Medio</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Click-through rate</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">CPC Medio</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Custo por clique</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Conversoes</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Total de conversoes</p>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">ROAS</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Impressoes</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Alcance</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">--</p>
        </div>
      </div>

      {/* Campaign Table Placeholder */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Campanhas — Ranking de Performance
        </h2>
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-sm">Nenhuma conta conectada</p>
          <p className="text-xs mt-1">
            Vai a{" "}
            <a href="/settings" className="text-[var(--primary)] underline">
              Definicoes
            </a>{" "}
            para conectar as tuas contas Meta e Google Ads
          </p>
        </div>
      </div>
    </div>
  );
}
