"use client";

import { useState, useEffect } from "react";

type AdAccount = {
  id: string;
  platform: "META" | "GOOGLE";
  platformAccountId: string;
  accountName: string;
  currency: string;
  isActive: boolean;
  _count: { campaigns: number };
};

type ConnectedProvider = {
  provider: string;
  hasToken: boolean;
};

export function SettingsClient({
  providers,
}: {
  providers: ConnectedProvider[];
}) {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const googleConnected = providers.some(
    (p) => p.provider === "google" && p.hasToken
  );
  const metaConnected = providers.some(
    (p) => p.provider === "facebook" && p.hasToken
  );

  async function handleDiscover() {
    setDiscovering(true);
    setDiscoverResult(null);
    try {
      const res = await fetch("/api/accounts/discover", { method: "POST" });
      const data = await res.json();

      const msgs: string[] = [];
      for (const r of data.results) {
        if (r.status === "ok" && r.accounts?.length > 0) {
          msgs.push(
            `${r.platform}: ${r.accounts.length} conta(s) encontrada(s)`
          );
        } else if (r.status === "skipped") {
          msgs.push(`${r.platform}: ${r.error}`);
        } else if (r.status === "error") {
          msgs.push(`${r.platform}: Erro — ${r.error}`);
        } else {
          msgs.push(`${r.platform}: Nenhuma conta encontrada`);
        }
      }
      setDiscoverResult(msgs.join(" | "));

      // Refresh accounts list
      const accRes = await fetch("/api/accounts");
      if (accRes.ok) setAccounts(await accRes.json());
    } catch {
      setDiscoverResult("Erro ao descobrir contas.");
    }
    setDiscovering(false);
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Estado das Conexões
          </h2>
          <button
            onClick={handleDiscover}
            disabled={discovering || (!googleConnected && !metaConnected)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {discovering ? "A descobrir..." : "Descobrir Contas de Ads"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              googleConnected
                ? "border-green-200 bg-green-50"
                : "border-[var(--border)]"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">Google Ads</p>
              <p
                className={`text-xs ${
                  googleConnected ? "text-green-600" : "text-[var(--muted-foreground)]"
                }`}
              >
                {googleConnected ? "Conectado" : "Não conectado"}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              metaConnected
                ? "border-green-200 bg-green-50"
                : "border-[var(--border)]"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">f</span>
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">Meta Ads</p>
              <p
                className={`text-xs ${
                  metaConnected ? "text-green-600" : "text-[var(--muted-foreground)]"
                }`}
              >
                {metaConnected ? "Conectado" : "Não conectado"}
              </p>
            </div>
          </div>
        </div>

        {discoverResult && (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--accent)] p-3 text-sm text-[var(--foreground)]">
            {discoverResult}
          </div>
        )}
      </div>

      {/* Discovered Ad Accounts */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Contas de Anúncios
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]" />
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] py-4">
            Nenhuma conta de ads encontrada. Conecta as plataformas acima e
            clica em &ldquo;Descobrir Contas de Ads&rdquo;.
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      acc.platform === "META" ? "bg-blue-600" : "bg-red-500"
                    }`}
                  >
                    <span className="text-white font-bold text-sm">
                      {acc.platform === "META" ? "f" : "G"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)] text-sm">
                      {acc.accountName}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {acc.platformAccountId} · {acc.currency} ·{" "}
                      {acc._count.campaigns} campanhas
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    acc.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {acc.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
