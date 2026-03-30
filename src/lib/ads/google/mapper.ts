import type { UnifiedCampaign, UnifiedMetrics, UnifiedAdAccount } from "@/types";

export class GoogleMapper {
  static toUnifiedAdAccount(raw: Record<string, unknown>): UnifiedAdAccount {
    const customer = raw.customer as Record<string, unknown> | undefined;
    return {
      platformAccountId: String(customer?.id ?? raw.id ?? ""),
      platform: "GOOGLE",
      accountName: String(customer?.descriptive_name ?? raw.descriptive_name ?? "Unknown"),
      currency: String(customer?.currency_code ?? raw.currency_code ?? "EUR"),
      timezone: String(customer?.time_zone ?? raw.time_zone ?? "Europe/Lisbon"),
    };
  }

  static toUnifiedCampaign(raw: Record<string, unknown>): UnifiedCampaign {
    const campaign = (raw.campaign ?? raw) as Record<string, unknown>;

    const statusMap: Record<string, UnifiedCampaign["status"]> = {
      ENABLED: "ACTIVE",
      PAUSED: "PAUSED",
      REMOVED: "ENDED",
    };

    const objectiveMap: Record<string, string> = {
      SEARCH: "TRAFFIC",
      DISPLAY: "AWARENESS",
      SHOPPING: "SALES",
      VIDEO: "AWARENESS",
      PERFORMANCE_MAX: "SALES",
      MULTI_CHANNEL: "TRAFFIC",
    };

    return {
      platformCampaignId: String(campaign.id ?? campaign.resource_name ?? ""),
      platform: "GOOGLE",
      name: String(campaign.name ?? ""),
      status: statusMap[String(campaign.status)] ?? "PAUSED",
      objective:
        objectiveMap[String(campaign.advertising_channel_type)] ?? String(campaign.advertising_channel_type ?? ""),
      dailyBudget: campaign.campaign_budget
        ? Number((campaign.campaign_budget as Record<string, unknown>).amount_micros ?? 0) / 1_000_000
        : undefined,
      currency: "EUR",
      startDate: campaign.start_date
        ? new Date(String(campaign.start_date))
        : undefined,
      endDate: campaign.end_date
        ? new Date(String(campaign.end_date))
        : undefined,
      platformData: raw,
    };
  }

  static toUnifiedMetrics(raw: Record<string, unknown>): UnifiedMetrics {
    const metrics = (raw.metrics ?? raw) as Record<string, unknown>;
    const segments = (raw.segments ?? {}) as Record<string, unknown>;

    const impressions = Number(metrics.impressions ?? 0);
    const clicks = Number(metrics.clicks ?? 0);
    const costMicros = Number(metrics.cost_micros ?? 0);
    const spend = costMicros / 1_000_000;
    const conversions = Number(metrics.conversions ?? 0);
    const conversionValue = Number(metrics.conversions_value ?? 0);

    return {
      date: segments.date
        ? new Date(String(segments.date))
        : new Date(),
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      spend,
      conversions,
      conversionValue,
      roas: spend > 0 ? conversionValue / spend : 0,
      qualityScore: metrics.quality_score
        ? Number(metrics.quality_score)
        : undefined,
      platformData: raw,
    };
  }
}
