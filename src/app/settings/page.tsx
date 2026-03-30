import { auth, signIn, signOut } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Definicoes
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Gere as tuas contas de anuncios e preferencias
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
                Terminar Sessao
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            Nao tens sessao iniciada.
          </p>
        )}
      </div>

      {/* Platform Connections */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Plataformas de Anuncios
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
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Conectar
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
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Conectar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
