export default function CampaignsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Campanhas
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Todas as tuas campanhas Meta e Google Ads
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
          Todas
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]">
          Meta
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]">
          Google
        </button>
        <div className="ml-auto flex gap-2">
          <select className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
            <option>Todas as status</option>
            <option>Ativas</option>
            <option>Pausadas</option>
            <option>Rascunho</option>
            <option>Terminadas</option>
          </select>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
              <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Campanha
              </th>
              <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Plataforma
              </th>
              <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Gasto
              </th>
              <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                CTR
              </th>
              <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                CPC
              </th>
              <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                Conversoes
              </th>
              <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                ROAS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="text-center py-12 text-[var(--muted-foreground)]">
                <p className="text-sm">Nenhuma campanha encontrada</p>
                <p className="text-xs mt-1">
                  Conecta as tuas contas em{" "}
                  <a href="/settings" className="text-[var(--primary)] underline">
                    Definicoes
                  </a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
