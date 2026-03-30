import type { Platform } from "@/types";
import type { AdPlatformAdapter } from "./adapter";
import { MetaAdsAdapter } from "./meta/adapter";
import { GoogleAdsAdapter } from "./google/adapter";

const adapters: Record<Platform, AdPlatformAdapter> = {
  META: new MetaAdsAdapter(),
  GOOGLE: new GoogleAdsAdapter(),
};

export function getAdapter(platform: Platform): AdPlatformAdapter {
  return adapters[platform];
}
