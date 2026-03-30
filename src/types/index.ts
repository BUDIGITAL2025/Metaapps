export type Platform = "META" | "GOOGLE";

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "ARCHIVED"
  | "ENDED"
  | "ERROR";

export type DraftStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED";

export type CampaignObjective =
  | "AWARENESS"
  | "TRAFFIC"
  | "ENGAGEMENT"
  | "LEADS"
  | "SALES"
  | "APP_INSTALLS";

export interface UnifiedAdAccount {
  platformAccountId: string;
  platform: Platform;
  accountName: string;
  currency: string;
  timezone: string;
}

export interface UnifiedCampaign {
  platformCampaignId: string;
  platform: Platform;
  name: string;
  status: CampaignStatus;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  platformData?: Record<string, unknown>;
}

export interface UnifiedMetrics {
  date: Date;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  roas: number;
  reach?: number; // Meta only
  qualityScore?: number; // Google only
  platformData?: Record<string, unknown>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CreateCampaignInput {
  platform: Platform;
  name: string;
  objective: CampaignObjective;
  dailyBudget?: number;
  lifetimeBudget?: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  targeting?: Record<string, unknown>;
  creative?: Record<string, unknown>;
}
