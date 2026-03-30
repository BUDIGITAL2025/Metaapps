export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Analytics
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Comparacao de performance entre Meta e Google Ads
        </p>
      </div>

      {/* Date Range */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--muted-foreground)]">De:</label>
          <input
            type="date"
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--muted-foreground)]">Ate:</label>
          <input
            type="date"
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Platform Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Meta Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">f</span>
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">Meta Ads</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Gasto</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">CTR</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">CPC</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">ROAS</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
          </div>
        </div>

        {/* Google Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">Google Ads</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Gasto</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">CTR</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">CPC</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">ROAS</p>
              <p className="text-lg font-bold text-[var(--foreground)]">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Performance ao Longo do Tempo
        </h2>
        <div className="h-64 flex items-center justify-center text-[var(--muted-foreground)]">
          <p className="text-sm">Conecta as tuas contas para ver graficos de performance</p>
        </div>
      </div>
    </div>
  );
}
