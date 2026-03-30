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
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {
    adAccount: { userId: session.user.id },
  };

  if (platform && platform !== "ALL") {
    where.platform = platform;
  }
  if (status && status !== "ALL") {
    where.status = status;
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      metrics: {
        orderBy: { date: "desc" },
        take: 30,
      },
      adAccount: {
        select: { accountName: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate aggregated metrics per campaign
  const enriched = campaigns.map((campaign) => {
    const totalMetrics = campaign.metrics.reduce(
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
      totalMetrics.impressions > 0
        ? (totalMetrics.clicks / totalMetrics.impressions) * 100
        : 0;
    const cpc =
      totalMetrics.clicks > 0
        ? totalMetrics.spend / totalMetrics.clicks
        : 0;
    const cpm =
      totalMetrics.impressions > 0
        ? (totalMetrics.spend / totalMetrics.impressions) * 1000
        : 0;
    const roas =
      totalMetrics.spend > 0
        ? totalMetrics.conversionValue / totalMetrics.spend
        : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      objective: campaign.objective,
      accountName: campaign.adAccount.accountName,
      metrics: {
        ...totalMetrics,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        roas: Math.round(roas * 100) / 100,
      },
    };
  });

  return NextResponse.json(enriched);
}
