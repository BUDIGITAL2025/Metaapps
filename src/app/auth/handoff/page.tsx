import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const METAAPPS_SECRET = process.env.METAAPPS_SECRET || "rivku-metaapps-shared-secret-change-me";

interface HandoffPayload {
  ott: boolean;
  exp: number;
  iat: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
    domain: string;
    markets: string[];
    category: string;
    competitors: string[];
    ticket_medio: number;
  };
  ads_tokens: {
    google: {
      access_token: string | null;
      refresh_token: string | null;
      customer_id: string | null;
    } | null;
    meta: {
      access_token: string | null;
      ad_account_id: string | null;
    } | null;
  };
  context: {
    top_pages: Array<{ url: string; sessions: number; revenue: number }>;
    keywords: Array<{ query: string; clicks: number; position: number }>;
    gsc_clicks: number;
    ga4_sessions: number;
    ga4_revenue: number;
  };
}

export default async function HandoffPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/login?error=missing_token");
  }

  let payload: HandoffPayload;

  try {
    payload = jwt.verify(token, METAAPPS_SECRET) as HandoffPayload;
  } catch (error) {
    console.error("Handoff token verification failed:", error);
    redirect("/login?error=invalid_token");
  }

  // Check if token is one-time and not expired
  if (!payload.ott) {
    redirect("/login?error=invalid_token_type");
  }

  // Create or find user
  const user = await prisma.user.upsert({
    where: { email: payload.user.email },
    update: {
      name: payload.user.name,
      updatedAt: new Date(),
    },
    create: {
      email: payload.user.email,
      name: payload.user.name,
    },
  });

  // Save Google Ads token if provided
  if (payload.ads_tokens?.google?.access_token) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: payload.ads_tokens.google.customer_id || payload.user.id,
        },
      },
      update: {
        access_token: payload.ads_tokens.google.access_token,
        refresh_token: payload.ads_tokens.google.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: payload.ads_tokens.google.customer_id || payload.user.id,
        access_token: payload.ads_tokens.google.access_token,
        refresh_token: payload.ads_tokens.google.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "Bearer",
        scope: "https://www.googleapis.com/auth/adwords",
      },
    });
  }

  // Save Meta Ads token if provided
  if (payload.ads_tokens?.meta?.access_token) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "facebook",
          providerAccountId: payload.ads_tokens.meta.ad_account_id || payload.user.id,
        },
      },
      update: {
        access_token: payload.ads_tokens.meta.access_token,
        expires_at: Math.floor(Date.now() / 1000) + 5184000, // 60 days
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "facebook",
        providerAccountId: payload.ads_tokens.meta.ad_account_id || payload.user.id,
        access_token: payload.ads_tokens.meta.access_token,
        expires_at: Math.floor(Date.now() / 1000) + 5184000,
        token_type: "Bearer",
        scope: "ads_management,ads_read",
      },
    });
  }

  // Create a simple session token for NextAuth
  // We'll use a server-side session cookie approach
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set("authjs.session-token", sessionToken, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // Encode context for the create page
  const contextParam = Buffer.from(
    JSON.stringify({
      project: payload.project,
      context: payload.context,
      rivku_user_id: payload.user.id,
    })
  ).toString("base64url");

  // Redirect to campaign creation with context
  redirect(`/campaigns/create?context=${contextParam}`);
}
