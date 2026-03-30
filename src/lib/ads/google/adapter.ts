import type { AdPlatformAdapter } from "../adapter";
import type {
  UnifiedAdAccount,
  UnifiedCampaign,
  UnifiedMetrics,
  DateRange,
  CreateCampaignInput,
} from "@/types";

export class GoogleAdsAdapter implements AdPlatformAdapter {
  platform = "GOOGLE" as const;

  async listAdAccounts(token: string): Promise<UnifiedAdAccount[]> {
    // TODO: Implement with google-ads-api
    // Uses CustomerService.listAccessibleCustomers
    throw new Error("Google listAdAccounts not implemented — requires Google Ads Developer Token");
  }

  async listCampaigns(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedCampaign[]> {
    // TODO: GAQL query: SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, ...
    throw new Error("Google listCampaigns not implemented");
  }

  async getCampaign(
    campaignId: string,
    token: string
  ): Promise<UnifiedCampaign> {
    // TODO: GAQL query for single campaign
    throw new Error("Google getCampaign not implemented");
  }

  async createCampaign(
    accountId: string,
    token: string,
    config: CreateCampaignInput
  ): Promise<UnifiedCampaign> {
    // TODO: CampaignService.mutateCampaigns with status=PAUSED
    throw new Error("Google createCampaign not implemented");
  }

  async pauseCampaign(
    campaignId: string,
    token: string
  ): Promise<void> {
    // TODO: CampaignService.mutateCampaigns to set status=PAUSED
    throw new Error("Google pauseCampaign not implemented");
  }

  async fetchMetrics(
    campaignId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    // TODO: GAQL query: SELECT metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, ...
    throw new Error("Google fetchMetrics not implemented");
  }

  async fetchAccountMetrics(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    // TODO: GAQL query for account-level metrics with segments.date
    throw new Error("Google fetchAccountMetrics not implemented");
  }
}
