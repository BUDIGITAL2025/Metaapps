import { Suspense } from "react";
import { CreateCampaignClient } from "@/components/campaigns/CreateCampaignClient";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function CreateCampaignsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateCampaignClient />
    </Suspense>
  );
}
