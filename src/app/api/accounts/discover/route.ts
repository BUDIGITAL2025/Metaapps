import { NextResponse } from "next/server";
import { auth, getValidToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/ads/registry";
import type { Platform } from "@/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const platforms: Platform[] = body.platform
    ? [body.platform]
    : ["META", "GOOGLE"];

  const results: Array<{
    platform: string;
    status: string;
    accounts?: Array<{ id: string; name: string }>;
    error?: string;
  }> = [];

  for (const platform of platforms) {
    const provider = platform === "META" ? "facebook" : "google";

    try {
      const token = await getValidToken(session.user.id, provider);
      if (!token) {
        results.push({
          platform,
          status: "skipped",
          error: `Sem token ${provider}. Conecta a plataforma primeiro.`,
        });
        continue;
      }

      const adapter = getAdapter(platform);
      const adAccounts = await adapter.listAdAccounts(token);

      const saved = [];
      for (const acc of adAccounts) {
        const dbAccount = await prisma.adAccount.upsert({
          where: {
            platform_platformAccountId: {
              platform,
              platformAccountId: acc.platformAccountId,
            },
          },
          update: {
            accountName: acc.accountName || `${platform} Account`,
            currency: acc.currency ?? "EUR",
            timezone: acc.timezone ?? "Europe/Lisbon",
            isActive: true,
          },
          create: {
            userId: session.user.id,
            platform,
            platformAccountId: acc.platformAccountId,
            accountName: acc.accountName || `${platform} Account`,
            currency: acc.currency ?? "EUR",
            timezone: acc.timezone ?? "Europe/Lisbon",
            isActive: true,
          },
        });
        saved.push({ id: dbAccount.id, name: dbAccount.accountName });
      }

      results.push({ platform, status: "ok", accounts: saved });
    } catch (error) {
      results.push({
        platform,
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return NextResponse.json({ results });
}
