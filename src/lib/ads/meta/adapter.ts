import type { AdPlatformAdapter } from "../adapter";
import type {
  UnifiedAdAccount,
  UnifiedCampaign,
  UnifiedMetrics,
  DateRange,
  CreateCampaignInput,
} from "@/types";

export class MetaAdsAdapter implements AdPlatformAdapter {
  platform = "META" as const;

  async listAdAccounts(token: string): Promise<UnifiedAdAccount[]> {
    // TODO: Implement with facebook-nodejs-business-sdk
    // GET /me/adaccounts?fields=name,currency,timezone_name,account_status
    throw new Error("Meta listAdAccounts not implemented — requires Meta App credentials");
  }

  async listCampaigns(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedCampaign[]> {
    // TODO: GET /act_{accountId}/campaigns?fields=name,status,objective,daily_budget,lifetime_budget,start_time,stop_time
    throw new Error("Meta listCampaigns not implemented");
  }

  async getCampaign(
    campaignId: string,
    token: string
  ): Promise<UnifiedCampaign> {
    // TODO: GET /{campaignId}?fields=name,status,objective,daily_budget,lifetime_budget
    throw new Error("Meta getCampaign not implemented");
  }

  async createCampaign(
    accountId: string,
    token: string,
    config: CreateCampaignInput
  ): Promise<UnifiedCampaign> {
    // TODO: POST /act_{accountId}/campaigns with status=PAUSED
    throw new Error("Meta createCampaign not implemented");
  }

  async pauseCampaign(
    campaignId: string,
    token: string
  ): Promise<void> {
    // TODO: POST /{campaignId} with status=PAUSED
    throw new Error("Meta pauseCampaign not implemented");
  }

  async fetchMetrics(
    campaignId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    // TODO: GET /{campaignId}/insights?fields=impressions,clicks,ctr,cpc,cpm,spend,actions,reach&time_range={...}
    throw new Error("Meta fetchMetrics not implemented");
  }

  async fetchAccountMetrics(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    // TODO: GET /act_{accountId}/insights?fields=...&time_increment=1
    throw new Error("Meta fetchAccountMetrics not implemented");
  }
}
