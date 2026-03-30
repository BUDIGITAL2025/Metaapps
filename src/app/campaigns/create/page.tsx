export default function CreateCampaignsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Criar Campanhas
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Cria campanhas em massa para Meta e Google Ads
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-sm font-medium">
            1
          </div>
          <span className="text-sm font-medium text-[var(--foreground)]">
            Configurar
          </span>
        </div>
        <div className="h-px flex-1 bg-[var(--border)]" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] flex items-center justify-center text-sm font-medium">
            2
          </div>
          <span className="text-sm text-[var(--muted-foreground)]">
            Rever
          </span>
        </div>
        <div className="h-px flex-1 bg-[var(--border)]" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] flex items-center justify-center text-sm font-medium">
            3
          </div>
          <span className="text-sm text-[var(--muted-foreground)]">
            Publicar
          </span>
        </div>
      </div>

      {/* Campaign Form */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Plataforma(s)
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--accent)] transition-colors">
                <input type="checkbox" className="rounded" />
                <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </span>
                <span className="text-sm font-medium">Meta Ads</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--accent)] transition-colors">
                <input type="checkbox" className="rounded" />
                <span className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </span>
                <span className="text-sm font-medium">Google Ads</span>
              </label>
            </div>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Nome da Campanha
            </label>
            <input
              type="text"
              placeholder="Ex: Promo Verao 2026"
              className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Objetivo
            </label>
            <select className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
              <option value="">Selecionar objetivo</option>
              <option value="AWARENESS">Awareness</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="LEADS">Leads</option>
              <option value="SALES">Sales</option>
              <option value="APP_INSTALLS">App Installs</option>
            </select>
          </div>

          {/* Daily Budget */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Orcamento Diario (EUR)
            </label>
            <input
              type="number"
              placeholder="50.00"
              className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Data de Inicio
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border)]">
          <button className="px-6 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors">
            Guardar como Rascunho
          </button>
          <button className="px-6 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity">
            Rever Campanha
          </button>
        </div>
      </div>
    </div>
  );
}
