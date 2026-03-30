import type {
  Platform,
  UnifiedAdAccount,
  UnifiedCampaign,
  UnifiedMetrics,
  DateRange,
  CreateCampaignInput,
} from "@/types";

export interface AdPlatformAdapter {
  platform: Platform;

  // Account operations
  listAdAccounts(token: string): Promise<UnifiedAdAccount[]>;

  // Campaign CRUD
  listCampaigns(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedCampaign[]>;

  getCampaign(
    campaignId: string,
    token: string
  ): Promise<UnifiedCampaign>;

  createCampaign(
    accountId: string,
    token: string,
    config: CreateCampaignInput
  ): Promise<UnifiedCampaign>;

  pauseCampaign(
    campaignId: string,
    token: string
  ): Promise<void>;

  // Metrics
  fetchMetrics(
    campaignId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]>;

  fetchAccountMetrics(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]>;
}
