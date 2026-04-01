import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/ads/registry";
import { getValidToken } from "@/lib/auth";
import type { Platform } from "@/types";

const PROVIDERS: Record<Platform, "google" | "facebook"> = {
  META: "facebook",
  GOOGLE: "google",
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout após ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function syncAllAccounts(userId: string) {
  const adAccounts = await prisma.adAccount.findMany({
    where: { userId, isActive: true },
  });

  const results = [];

  for (const account of adAccounts) {
    try {
      const token = await getValidToken(
        userId,
        PROVIDERS[account.platform as Platform]
      );
      if (!token) {
        results.push({
          account: account.accountName,
          status: "skipped",
          reason: "No valid token",
        });
        continue;
      }

      await withTimeout(syncAccount(account, token), 30000);
      results.push({ account: account.accountName, status: "synced" });
    } catch (error) {
      results.push({
        account: account.accountName,
        status: "error",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

async function syncAccount(
  account: { id: string; platform: string; platformAccountId: string },
  token: string
) {
  const adapter = getAdapter(account.platform as Platform);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dateRange = { startDate: thirtyDaysAgo, endDate: now };

  // Sync campaigns
  const campaigns = await adapter.listCampaigns(
    account.platformAccountId,
    token,
    dateRange
  );

  for (const campaign of campaigns) {
    const dbCampaign = await prisma.campaign.upsert({
      where: {
        platform_platformCampaignId: {
          platform: account.platform as Platform,
          platformCampaignId: campaign.platformCampaignId,
        },
      },
      update: {
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        dailyBudget: campaign.dailyBudget,
        lifetimeBudget: campaign.lifetimeBudget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        platformData: (campaign.platformData as Record<string, string>) ?? undefined,
        syncedAt: now,
      },
      create: {
        adAccountId: account.id,
        platform: account.platform as Platform,
        platformCampaignId: campaign.platformCampaignId,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        dailyBudget: campaign.dailyBudget,
        lifetimeBudget: campaign.lifetimeBudget,
        currency: "EUR",
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        platformData: (campaign.platformData as Record<string, string>) ?? undefined,
        syncedAt: now,
      },
    });

    // Sync metrics for this campaign
    try {
      const campaignId =
        account.platform === "GOOGLE"
          ? `${account.platformAccountId}:${campaign.platformCampaignId}`
          : campaign.platformCampaignId;

      const metrics = await adapter.fetchMetrics(campaignId, token, dateRange);

      for (const metric of metrics) {
        await prisma.campaignMetrics.upsert({
          where: {
            campaignId_date: {
              campaignId: dbCampaign.id,
              date: metric.date,
            },
          },
          update: {
            impressions: metric.impressions,
            clicks: metric.clicks,
            ctr: metric.ctr,
            cpc: metric.cpc,
            cpm: metric.cpm,
            spend: metric.spend,
            conversions: metric.conversions,
            conversionValue: metric.conversionValue,
            roas: metric.roas,
            reach: metric.reach,
            qualityScore: metric.qualityScore,
            platformData: (metric.platformData as Record<string, string>) ?? undefined,
            syncedAt: now,
          },
          create: {
            campaignId: dbCampaign.id,
            date: metric.date,
            impressions: metric.impressions,
            clicks: metric.clicks,
            ctr: metric.ctr,
            cpc: metric.cpc,
            cpm: metric.cpm,
            spend: metric.spend,
            conversions: metric.conversions,
            conversionValue: metric.conversionValue,
            roas: metric.roas,
            reach: metric.reach,
            qualityScore: metric.qualityScore,
            platformData: (metric.platformData as Record<string, string>) ?? undefined,
          },
        });
      }
    } catch {
      // Skip metrics if they fail — campaign is still synced
    }
  }
}
