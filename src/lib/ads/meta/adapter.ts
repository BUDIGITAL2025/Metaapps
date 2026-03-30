import type { AdPlatformAdapter } from "../adapter";
import type {
  UnifiedAdAccount,
  UnifiedCampaign,
  UnifiedMetrics,
  DateRange,
  CreateCampaignInput,
} from "@/types";
import { MetaMapper } from "./mapper";

const META_API_VERSION = "v21.0";
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaAdsAdapter implements AdPlatformAdapter {
  platform = "META" as const;

  async listAdAccounts(token: string): Promise<UnifiedAdAccount[]> {
    const res = await fetch(
      `${META_API_BASE}/me/adaccounts?fields=id,name,currency,timezone_name,account_status&access_token=${token}`
    );
    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
    return (data.data ?? []).map(MetaMapper.toUnifiedAdAccount);
  }

  async listCampaigns(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedCampaign[]> {
    const res = await fetch(
      `${META_API_BASE}/act_${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&limit=500&access_token=${token}`
    );
    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
    return (data.data ?? []).map(MetaMapper.toUnifiedCampaign);
  }

  async getCampaign(
    campaignId: string,
    token: string
  ): Promise<UnifiedCampaign> {
    const res = await fetch(
      `${META_API_BASE}/${campaignId}?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${token}`
    );
    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
    return MetaMapper.toUnifiedCampaign(data);
  }

  async createCampaign(
    accountId: string,
    token: string,
    config: CreateCampaignInput
  ): Promise<UnifiedCampaign> {
    const objectiveMap: Record<string, string> = {
      AWARENESS: "OUTCOME_AWARENESS",
      TRAFFIC: "OUTCOME_TRAFFIC",
      ENGAGEMENT: "OUTCOME_ENGAGEMENT",
      LEADS: "OUTCOME_LEADS",
      SALES: "OUTCOME_SALES",
      APP_INSTALLS: "OUTCOME_APP_PROMOTION",
    };

    const params = new URLSearchParams({
      name: config.name,
      objective: objectiveMap[config.objective] ?? "OUTCOME_TRAFFIC",
      status: "PAUSED",
      special_ad_categories: "[]",
      access_token: token,
    });

    if (config.dailyBudget) {
      params.set("daily_budget", String(Math.round(config.dailyBudget * 100)));
    }

    const res = await fetch(`${META_API_BASE}/act_${accountId}/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
    return this.getCampaign(data.id, token);
  }

  async pauseCampaign(campaignId: string, token: string): Promise<void> {
    const res = await fetch(`${META_API_BASE}/${campaignId}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        status: "PAUSED",
        access_token: token,
      }).toString(),
    });
    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
  }

  async fetchMetrics(
    campaignId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    const timeRange = JSON.stringify({
      since: dateRange.startDate.toISOString().split("T")[0],
      until: dateRange.endDate.toISOString().split("T")[0],
    });

    const res = await fetch(
      `${META_API_BASE}/${campaignId}/insights?fields=impressions,clicks,ctr,cpc,cpm,spend,actions,action_values,purchase_roas,reach&time_range=${encodeURIComponent(timeRange)}&time_increment=1&access_token=${token}`
    );
    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
    return (data.data ?? []).map(MetaMapper.toUnifiedMetrics);
  }

  async fetchAccountMetrics(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    const timeRange = JSON.stringify({
      since: dateRange.startDate.toISOString().split("T")[0],
      until: dateRange.endDate.toISOString().split("T")[0],
    });

    const res = await fetch(
      `${META_API_BASE}/act_${accountId}/insights?fields=impressions,clicks,ctr,cpc,cpm,spend,actions,action_values,purchase_roas,reach&time_range=${encodeURIComponent(timeRange)}&time_increment=1&access_token=${token}`
    );
    const data = await res.json();
    if (data.error) throw new Error(`Meta API: ${data.error.message}`);
    return (data.data ?? []).map(MetaMapper.toUnifiedMetrics);
  }
}
