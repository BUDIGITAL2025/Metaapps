import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  // Check which providers are connected with valid tokens
  const providers: Array<{ provider: string; hasToken: boolean }> = [];
  if (session?.user?.id) {
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true, access_token: true },
    });
    for (const acc of accounts) {
      providers.push({
        provider: acc.provider,
        hasToken: !!acc.access_token,
      });
    }
  }

  const googleConnected = providers.some((p) => p.provider === "google");
  const metaConnected = providers.some((p) => p.provider === "facebook");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Definições
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Gere as tuas contas de anúncios e preferências
        </p>
      </div>

      {/* User Info */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Conta
        </h2>
        {session?.user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {session.user.name}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {session.user.email}
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                Terminar Sessão
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            Não tens sessão iniciada.
          </p>
        )}
      </div>

      {/* Platform Connections */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Conectar Plataformas
        </h2>
        <div className="space-y-4">
          {/* Meta Ads */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">f</span>
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Meta Ads
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Facebook & Instagram Ads
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signIn("facebook");
              }}
            >
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  metaConnected
                    ? "border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {metaConnected ? "Reconectar" : "Conectar"}
              </button>
            </form>
          </div>

          {/* Google Ads */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Google Ads
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Search, Display, YouTube Ads
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  googleConnected
                    ? "border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {googleConnected ? "Reconectar" : "Conectar"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Ad Accounts Discovery + List */}
      <SettingsClient providers={providers} />
    </div>
  );
}
