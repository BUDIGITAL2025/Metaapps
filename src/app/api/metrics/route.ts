import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const days = Number(searchParams.get("days") ?? 30);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const platformFilter =
    platform && platform !== "ALL" ? { platform: platform as "META" | "GOOGLE" } : {};

  // Aggregated KPIs
  const metrics = await prisma.campaignMetrics.findMany({
    where: {
      date: { gte: since },
      campaign: {
        adAccount: { userId: session.user.id },
        ...platformFilter,
      },
    },
    select: {
      date: true,
      impressions: true,
      clicks: true,
      spend: true,
      conversions: true,
      conversionValue: true,
      reach: true,
      campaign: {
        select: { platform: true },
      },
    },
  });

  const totals = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      clicks: acc.clicks + m.clicks,
      spend: acc.spend + m.spend,
      conversions: acc.conversions + m.conversions,
      conversionValue: acc.conversionValue + m.conversionValue,
      reach: acc.reach + (m.reach ?? 0),
    }),
    { impressions: 0, clicks: 0, spend: 0, conversions: 0, conversionValue: 0, reach: 0 }
  );

  const ctr =
    totals.impressions > 0
      ? (totals.clicks / totals.impressions) * 100
      : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const cpm =
    totals.impressions > 0
      ? (totals.spend / totals.impressions) * 1000
      : 0;
  const roas =
    totals.spend > 0 ? totals.conversionValue / totals.spend : 0;

  // Daily breakdown for charts
  const dailyMap = new Map<string, { impressions: number; clicks: number; spend: number; conversions: number }>();
  for (const m of metrics) {
    const dateKey = m.date.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey) ?? {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
    };
    dailyMap.set(dateKey, {
      impressions: existing.impressions + m.impressions,
      clicks: existing.clicks + m.clicks,
      spend: existing.spend + m.spend,
      conversions: existing.conversions + m.conversions,
    });
  }

  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  // Platform breakdown
  const metaMetrics = metrics.filter((m) => m.campaign.platform === "META");
  const googleMetrics = metrics.filter((m) => m.campaign.platform === "GOOGLE");

  function aggregate(items: typeof metrics) {
    const t = items.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        spend: acc.spend + m.spend,
        conversions: acc.conversions + m.conversions,
        conversionValue: acc.conversionValue + m.conversionValue,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0, conversionValue: 0 }
    );
    return {
      ...t,
      ctr: t.impressions > 0 ? Math.round((t.clicks / t.impressions) * 10000) / 100 : 0,
      cpc: t.clicks > 0 ? Math.round((t.spend / t.clicks) * 100) / 100 : 0,
      cpm: t.impressions > 0 ? Math.round((t.spend / t.impressions) * 100000) / 100 : 0,
      roas: t.spend > 0 ? Math.round((t.conversionValue / t.spend) * 100) / 100 : 0,
    };
  }

  return NextResponse.json({
    totals: {
      ...totals,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      cpm: Math.round(cpm * 100) / 100,
      roas: Math.round(roas * 100) / 100,
    },
    daily,
    byPlatform: {
      META: aggregate(metaMetrics),
      GOOGLE: aggregate(googleMetrics),
    },
  });
}
