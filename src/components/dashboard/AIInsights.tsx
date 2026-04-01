"use client";

import { useState, useEffect } from "react";

interface Insight {
  type: "danger" | "warning" | "success" | "ai";
  title: string;
  detail: string;
  impact?: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

const TYPE_STYLES: Record<string, { border: string; bg: string; icon: string; label: string }> = {
  danger: { border: "#dc2626", bg: "#fef2f2", icon: "⚠", label: "Alerta" },
  warning: { border: "#D97706", bg: "#fffbeb", icon: "⚡", label: "Atenção" },
  success: { border: "#22c55e", bg: "#f0fdf4", icon: "✓", label: "Positivo" },
  ai: { border: "#7c3aed", bg: "#f5f3ff", icon: "◆", label: "Insight IA" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  high: { bg: "#fef2f2", text: "#dc2626" },
  medium: { bg: "#fffbeb", text: "#D97706" },
  low: { bg: "#f0fdf4", text: "#22c55e" },
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0, 1, 2]));

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((data) => setInsights(data.insights ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          Insights & Ações Recomendadas
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] py-4">
          Sincroniza os dados para gerar insights automáticos sobre as tuas campanhas.
        </p>
      </div>
    );
  }

  function toggleExpand(idx: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Insights & Ações Recomendadas
        </h2>
        <span className="text-xs px-2 py-1 rounded-full bg-[#f5f3ff] text-[#7c3aed] font-medium">
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mb-5">
        Análise automática das tuas campanhas com recomendações priorizadas
      </p>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const style = TYPE_STYLES[insight.type];
          const prioStyle = PRIORITY_STYLES[insight.priority];
          const isExpanded = expanded.has(idx);

          return (
            <div
              key={idx}
              className="rounded-lg border overflow-hidden cursor-pointer transition-all"
              style={{
                borderColor: "var(--border)",
                borderLeftWidth: "4px",
                borderLeftColor: style.border,
              }}
              onClick={() => toggleExpand(idx)}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: style.bg }}
              >
                <span className="text-base flex-shrink-0">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: style.border, color: "#fff" }}
                    >
                      {style.label}
                    </span>
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: prioStyle.bg,
                        color: prioStyle.text,
                      }}
                    >
                      Prioridade {PRIORITY_LABELS[insight.priority]}
                    </span>
                    {insight.impact && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--card)] text-[var(--foreground)]">
                        {insight.impact}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)] mt-1 truncate">
                    {insight.title}
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`flex-shrink-0 text-[var(--muted-foreground)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className="px-4 py-3 space-y-2 bg-[var(--card)]">
                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {insight.detail}
                  </p>
                  {insight.action && (
                    <div className="flex items-start gap-2 rounded-lg bg-[var(--accent)] p-3">
                      <span className="text-xs font-bold text-[var(--primary)] flex-shrink-0 mt-0.5">
                        AÇÃO:
                      </span>
                      <p className="text-xs text-[var(--foreground)]">
                        {insight.action}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
