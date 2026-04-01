"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface DraftItem {
  id: string;
  platform: "META" | "GOOGLE";
  name: string;
  objective: string;
  budget: number;
  currency: string;
  targetPage?: string;
}

interface RivkuContext {
  project?: {
    id: string;
    name: string;
    domain: string;
    markets: string[];
    category: string;
    competitors: string[];
    ticket_medio: number;
  };
  context?: {
    top_pages: Array<{ url: string; sessions: number; revenue: number }>;
    keywords: Array<{ query: string; clicks: number; position: number }>;
    gsc_clicks: number;
    ga4_sessions: number;
    ga4_revenue: number;
  };
  rivku_user_id?: string;
}

const OBJECTIVES = [
  { value: "AWARENESS", label: "Awareness", desc: "Aumentar reconhecimento da marca" },
  { value: "TRAFFIC", label: "Traffic", desc: "Gerar visitas ao site" },
  { value: "ENGAGEMENT", label: "Engagement", desc: "Interacoes com conteudo" },
  { value: "LEADS", label: "Leads", desc: "Captar contactos" },
  { value: "SALES", label: "Sales", desc: "Gerar vendas directas" },
  { value: "APP_INSTALLS", label: "App Installs", desc: "Instalacoes de app" },
];

export function CreateCampaignClient() {
  const searchParams = useSearchParams();
  const [rivkuContext, setRivkuContext] = useState<RivkuContext | null>(null);
  const [step, setStep] = useState(1);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [platforms, setPlatforms] = useState<Set<"META" | "GOOGLE">>(new Set());
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState("");
  const [rows, setRows] = useState(1);
  const [selectedPage, setSelectedPage] = useState("");

  // Parse RIVKU context from URL
  useEffect(() => {
    const contextParam = searchParams.get("context");
    if (contextParam) {
      try {
        const decoded = JSON.parse(
          Buffer.from(contextParam, "base64url").toString("utf-8")
        );
        setRivkuContext(decoded);

        // Pre-fill based on context
        if (decoded.project?.domain) {
          setName(`Campanha ${decoded.project.domain}`);
        }
        if (decoded.context?.ga4_revenue > 0) {
          setObjective("SALES");
        } else {
          setObjective("TRAFFIC");
        }
        // Suggest budget based on ticket medio
        if (decoded.project?.ticket_medio) {
          setBudget(String(Math.round(decoded.project.ticket_medio / 10)));
        }
      } catch (e) {
        console.error("Failed to parse RIVKU context:", e);
      }
    }
  }, [searchParams]);

  function togglePlatform(p: "META" | "GOOGLE") {
    const next = new Set(platforms);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setPlatforms(next);
  }

  function addToDrafts() {
    if (!name || !objective || platforms.size === 0) return;

    const newDrafts: DraftItem[] = [];
    for (const p of platforms) {
      for (let i = 0; i < rows; i++) {
        const suffix = rows > 1 ? ` #${i + 1}` : "";
        newDrafts.push({
          id: crypto.randomUUID(),
          platform: p,
          name: `${name}${suffix}`,
          objective,
          budget: Number(budget) || 50,
          currency: "EUR",
          targetPage: selectedPage || undefined,
        });
      }
    }

    setDrafts([...drafts, ...newDrafts]);
    setName("");
    setObjective("");
    setBudget("");
    setRows(1);
    setSelectedPage("");
  }

  function removeDraft(id: string) {
    setDrafts(drafts.filter((d) => d.id !== id));
  }

  async function saveDrafts() {
    setSaving(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          drafts.map((d) => ({
            platform: d.platform,
            name: d.name,
            objective: d.objective,
            budget: d.budget,
            currency: d.currency,
            targeting: d.targetPage ? { landing_page: d.targetPage } : undefined,
          }))
        ),
      });

      if (res.ok) {
        setSaved(true);
        setStep(3);
      }
    } catch {
      // Error saving
    }
    setSaving(false);
  }

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

  const topPages = rivkuContext?.context?.top_pages || [];
  const keywords = rivkuContext?.context?.keywords || [];
  const hasRivkuContext = !!rivkuContext?.project;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Criar Campanhas
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {hasRivkuContext
            ? `Criar campanhas para ${rivkuContext.project?.domain}`
            : "Cria campanhas em massa para Meta e Google Ads"}
        </p>
      </div>

      {/* RIVKU Context Banner */}
      {hasRivkuContext && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-green-800">
                Contexto RIVKU carregado
              </div>
              <div className="text-xs text-green-600">
                {rivkuContext.project?.domain} • {rivkuContext.project?.markets?.join(", ")}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <div className="text-lg font-bold text-green-700">
                {rivkuContext.context?.ga4_sessions?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">Sessoes GA4</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-lg font-bold text-green-700">
                {rivkuContext.context?.gsc_clicks?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">Cliques GSC</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-lg font-bold text-green-700">
                EUR {rivkuContext.context?.ga4_revenue?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">Receita GA4</div>
            </div>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { n: 1, label: "Configurar" },
          { n: 2, label: "Rever" },
          { n: 3, label: "Publicar" },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s.n
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
              }`}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span
              className={`text-sm ${
                step >= s.n
                  ? "font-medium text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {s.label}
            </span>
            {s.n < 3 && <div className="h-px w-12 bg-[var(--border)] mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Configure */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Plataforma(s)
                </label>
                <div className="flex gap-3">
                  <label
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      platforms.has("META")
                        ? "border-blue-500 bg-blue-50"
                        : "border-[var(--border)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={platforms.has("META")}
                      onChange={() => togglePlatform("META")}
                      className="rounded"
                    />
                    <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">f</span>
                    </span>
                    <span className="text-sm font-medium">Meta Ads</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      platforms.has("GOOGLE")
                        ? "border-red-500 bg-red-50"
                        : "border-[var(--border)] hover:bg-[var(--accent)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={platforms.has("GOOGLE")}
                      onChange={() => togglePlatform("GOOGLE")}
                      className="rounded"
                    />
                    <span className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </span>
                    <span className="text-sm font-medium">Google Ads</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Promo Verao 2026"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Objetivo
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Selecionar objetivo</option>
                  {OBJECTIVES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page selector from RIVKU context */}
              {topPages.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Pagina a Promover (do RIVKU)
                  </label>
                  <select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  >
                    <option value="">Selecionar pagina...</option>
                    {topPages.map((page, i) => (
                      <option key={i} value={page.url}>
                        {page.url} ({page.sessions} sessoes, EUR {page.revenue})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Orcamento Diario (EUR)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Numero de Variacoes
                </label>
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={50}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Cria multiplas variacoes da mesma campanha
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-[var(--border)]">
              <button
                onClick={addToDrafts}
                disabled={!name || !objective || platforms.size === 0}
                className="px-6 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
              >
                + Adicionar ao Lote ({drafts.length} campanhas)
              </button>
              <button
                onClick={() => {
                  if (drafts.length === 0) addToDrafts();
                  if (drafts.length > 0 || (name && objective && platforms.size > 0))
                    setStep(2);
                }}
                disabled={drafts.length === 0 && (!name || !objective || platforms.size === 0)}
                className="px-6 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Rever Campanhas →
              </button>
            </div>
          </div>

          {/* Sidebar with RIVKU data */}
          {hasRivkuContext && (
            <div className="space-y-4">
              {/* Top Keywords */}
              {keywords.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                    Top Keywords (GSC)
                  </h3>
                  <div className="space-y-2">
                    {keywords.slice(0, 5).map((kw, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[var(--foreground)] truncate flex-1">
                          {kw.query}
                        </span>
                        <span className="text-[var(--muted-foreground)] ml-2">
                          pos {Math.round(kw.position)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitors */}
              {rivkuContext.project?.competitors && rivkuContext.project.competitors.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                    Concorrentes
                  </h3>
                  <div className="space-y-2">
                    {rivkuContext.project.competitors.map((c, i) => (
                      <div
                        key={i}
                        className="text-xs text-[var(--muted-foreground)]"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Rever {drafts.length} Campanhas
            </h2>
            <span className="text-sm text-[var(--muted-foreground)]">
              Serao criadas como PAUSED — nao gastam dinheiro
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">
                  Nome
                </th>
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">
                  Plataforma
                </th>
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">
                  Objetivo
                </th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">
                  Orcamento/dia
                </th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase px-6 py-3">
                  Acao
                </th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
                >
                  <td className="px-6 py-3 text-sm text-[var(--foreground)]">
                    {d.name}
                  </td>
                  <td className="px-6 py-3">{platformBadge(d.platform)}</td>
                  <td className="px-6 py-3 text-sm text-[var(--foreground)]">
                    {d.objective}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-[var(--foreground)]">
                    EUR {d.budget.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => removeDraft(d.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-[var(--border)] flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              ← Voltar
            </button>
            <button
              onClick={saveDrafts}
              disabled={saving || drafts.length === 0}
              className="px-6 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "A guardar..." : `Aprovar e Guardar ${drafts.length} Campanhas`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Published */}
      {step === 3 && saved && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            Campanhas Guardadas!
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            {drafts.length} campanhas foram guardadas como rascunho. Quando conectares as tuas contas
            e aprovares, serao publicadas como PAUSED nas plataformas.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setDrafts([]);
                setSaved(false);
                setStep(1);
              }}
              className="px-6 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              Criar Mais Campanhas
            </button>
            <a
              href="/campaigns"
              className="px-6 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            >
              Ver Campanhas
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
