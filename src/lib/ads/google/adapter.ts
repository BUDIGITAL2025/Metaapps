import { GoogleAdsApi } from "google-ads-api";
import type { AdPlatformAdapter } from "../adapter";
import type {
  UnifiedAdAccount,
  UnifiedCampaign,
  UnifiedMetrics,
  DateRange,
  CreateCampaignInput,
} from "@/types";
import { GoogleMapper } from "./mapper";

function getClient() {
  return new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export class GoogleAdsAdapter implements AdPlatformAdapter {
  platform = "GOOGLE" as const;

  async listAdAccounts(token: string): Promise<UnifiedAdAccount[]> {
    const client = getClient();
    const customers = await client.listAccessibleCustomers(token);

    const accounts: UnifiedAdAccount[] = [];
    for (const resourceName of customers.resource_names ?? []) {
      const customerId = resourceName.replace("customers/", "");
      try {
        const customer = client.Customer({
          customer_id: customerId,
          refresh_token: token,
        });
        const [info] = await customer.query(`
          SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone
          FROM customer
          LIMIT 1
        `);
        if (info) accounts.push(GoogleMapper.toUnifiedAdAccount(info as Record<string, unknown>));
      } catch {
        // Skip accounts we can't access
      }
    }
    return accounts;
  }

  async listCampaigns(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedCampaign[]> {
    const client = getClient();
    const customer = client.Customer({
      customer_id: accountId,
      refresh_token: token,
    });

    const campaigns = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `);

    return campaigns.map((c) => GoogleMapper.toUnifiedCampaign(c as Record<string, unknown>));
  }

  async getCampaign(
    campaignId: string,
    token: string
  ): Promise<UnifiedCampaign> {
    // campaignId format: "accountId:campaignId"
    const [accountId, cId] = campaignId.split(":");
    const client = getClient();
    const customer = client.Customer({
      customer_id: accountId,
      refresh_token: token,
    });

    const [campaign] = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.id = ${cId}
    `);

    if (!campaign) throw new Error("Campaign not found");
    return GoogleMapper.toUnifiedCampaign(campaign as Record<string, unknown>);
  }

  async createCampaign(
    accountId: string,
    token: string,
    config: CreateCampaignInput
  ): Promise<UnifiedCampaign> {
    const client = getClient();
    const customer = client.Customer({
      customer_id: accountId,
      refresh_token: token,
    });

    // Create campaign budget first
    const budgetMicros = Math.round((config.dailyBudget ?? 50) * 1_000_000);
    const budgetResponse = await customer.campaignBudgets.create([
      {
        name: `${config.name} Budget`,
        amount_micros: budgetMicros,
        delivery_method: "STANDARD" as unknown as number,
      },
    ]);
    const budgetResourceName = (budgetResponse as unknown as { results: Array<{ resource_name: string }> }).results?.[0]?.resource_name ?? "";

    // Create campaign as PAUSED
    const channelMap: Record<string, string> = {
      AWARENESS: "DISPLAY",
      TRAFFIC: "SEARCH",
      ENGAGEMENT: "DISPLAY",
      LEADS: "SEARCH",
      SALES: "PERFORMANCE_MAX",
      APP_INSTALLS: "MULTI_CHANNEL",
    };

    const campaignResponse = await customer.campaigns.create([
      {
        name: config.name,
        status: "PAUSED" as unknown as number,
        advertising_channel_type: (channelMap[config.objective] ?? "SEARCH") as unknown as number,
        campaign_budget: budgetResourceName,
      },
    ]);
    const campaignResourceName = (campaignResponse as unknown as { results: Array<{ resource_name: string }> }).results?.[0]?.resource_name ?? "";

    return {
      platformCampaignId: campaignResourceName,
      platform: "GOOGLE",
      name: config.name,
      status: "PAUSED",
      objective: config.objective,
      dailyBudget: config.dailyBudget,
      currency: config.currency,
    };
  }

  async pauseCampaign(campaignId: string, token: string): Promise<void> {
    const [accountId, cId] = campaignId.split(":");
    const client = getClient();
    const customer = client.Customer({
      customer_id: accountId,
      refresh_token: token,
    });

    await customer.campaigns.update([
      {
        resource_name: `customers/${accountId}/campaigns/${cId}`,
        status: "PAUSED" as unknown as number,
      },
    ]);
  }

  async fetchMetrics(
    campaignId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    const [accountId, cId] = campaignId.split(":");
    const client = getClient();
    const customer = client.Customer({
      customer_id: accountId,
      refresh_token: token,
    });

    const rows = await customer.query(`
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE campaign.id = ${cId}
        AND segments.date BETWEEN '${formatDate(dateRange.startDate)}' AND '${formatDate(dateRange.endDate)}'
      ORDER BY segments.date
    `);

    return rows.map((r) => GoogleMapper.toUnifiedMetrics(r as Record<string, unknown>));
  }

  async fetchAccountMetrics(
    accountId: string,
    token: string,
    dateRange: DateRange
  ): Promise<UnifiedMetrics[]> {
    const client = getClient();
    const customer = client.Customer({
      customer_id: accountId,
      refresh_token: token,
    });

    const rows = await customer.query(`
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM customer
      WHERE segments.date BETWEEN '${formatDate(dateRange.startDate)}' AND '${formatDate(dateRange.endDate)}'
      ORDER BY segments.date
    `);

    return rows.map((r) => GoogleMapper.toUnifiedMetrics(r as Record<string, unknown>));
  }
}
