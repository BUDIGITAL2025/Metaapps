import type { UnifiedCampaign, UnifiedMetrics, UnifiedAdAccount } from "@/types";

export class MetaMapper {
  static toUnifiedAdAccount(raw: Record<string, unknown>): UnifiedAdAccount {
    return {
      platformAccountId: String(raw.id ?? "").replace("act_", ""),
      platform: "META",
      accountName: String(raw.name ?? "Unknown"),
      currency: String(raw.currency ?? "EUR"),
      timezone: String(raw.timezone_name ?? "Europe/Lisbon"),
    };
  }

  static toUnifiedCampaign(raw: Record<string, unknown>): UnifiedCampaign {
    const statusMap: Record<string, UnifiedCampaign["status"]> = {
      ACTIVE: "ACTIVE",
      PAUSED: "PAUSED",
      ARCHIVED: "ARCHIVED",
      DELETED: "ENDED",
    };

    return {
      platformCampaignId: String(raw.id ?? ""),
      platform: "META",
      name: String(raw.name ?? ""),
      status: statusMap[String(raw.status)] ?? "PAUSED",
      objective: String(raw.objective ?? ""),
      dailyBudget: raw.daily_budget
        ? Number(raw.daily_budget) / 100
        : undefined,
      lifetimeBudget: raw.lifetime_budget
        ? Number(raw.lifetime_budget) / 100
        : undefined,
      currency: "EUR",
      startDate: raw.start_time
        ? new Date(String(raw.start_time))
        : undefined,
      endDate: raw.stop_time ? new Date(String(raw.stop_time)) : undefined,
      platformData: raw,
    };
  }

  static toUnifiedMetrics(raw: Record<string, unknown>): UnifiedMetrics {
    const impressions = Number(raw.impressions ?? 0);
    const clicks = Number(raw.clicks ?? 0);
    const spend = Number(raw.spend ?? 0);

    return {
      date: new Date(String(raw.date_start ?? new Date().toISOString())),
      impressions,
      clicks,
      ctr: Number(raw.ctr ?? 0),
      cpc: Number(raw.cpc ?? 0),
      cpm: Number(raw.cpm ?? 0),
      spend,
      conversions: MetaMapper.extractConversions(raw),
      conversionValue: MetaMapper.extractConversionValue(raw),
      roas: Number((raw.purchase_roas as Array<{ value: string }> | undefined)?.[0]?.value ?? 0),
      reach: Number(raw.reach ?? 0),
      platformData: raw,
    };
  }

  private static extractConversions(raw: Record<string, unknown>): number {
    const actions = raw.actions as Array<{ action_type: string; value: string }> | undefined;
    if (!actions) return 0;
    const purchase = actions.find(
      (a) =>
        a.action_type === "purchase" ||
        a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    return purchase ? Number(purchase.value) : 0;
  }

  private static extractConversionValue(raw: Record<string, unknown>): number {
    const values = raw.action_values as Array<{ action_type: string; value: string }> | undefined;
    if (!values) return 0;
    const purchase = values.find(
      (a) =>
        a.action_type === "purchase" ||
        a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    return purchase ? Number(purchase.value) : 0;
  }
}
