import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type InsightType = "danger" | "warning" | "success" | "ai";

interface Insight {
  type: InsightType;
  title: string;
  detail: string;
  impact?: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Current period metrics
  const currentMetrics = await prisma.campaignMetrics.findMany({
    where: {
      date: { gte: thirtyDaysAgo },
      campaign: { adAccount: { userId: session.user.id } },
    },
    include: {
      campaign: {
        select: { name: true, platform: true, status: true, dailyBudget: true, adAccount: { select: { accountName: true } } },
      },
    },
  });

  // Previous period metrics (for MoM comparison)
  const previousMetrics = await prisma.campaignMetrics.findMany({
    where: {
      date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      campaign: { adAccount: { userId: session.user.id } },
    },
    select: { spend: true, clicks: true, impressions: true, conversions: true, conversionValue: true },
  });

  // Campaigns
  const campaigns = await prisma.campaign.findMany({
    where: { adAccount: { userId: session.user.id } },
    include: {
      metrics: { where: { date: { gte: thirtyDaysAgo } } },
      adAccount: { select: { accountName: true } },
    },
  });

  const insights: Insight[] = [];

  // Aggregate current period
  const curr = {
    spend: currentMetrics.reduce((s, m) => s + m.spend, 0),
    clicks: currentMetrics.reduce((s, m) => s + m.clicks, 0),
    impressions: currentMetrics.reduce((s, m) => s + m.impressions, 0),
    conversions: currentMetrics.reduce((s, m) => s + m.conversions, 0),
    conversionValue: currentMetrics.reduce((s, m) => s + m.conversionValue, 0),
  };

  // Aggregate previous period
  const prev = {
    spend: previousMetrics.reduce((s, m) => s + m.spend, 0),
    clicks: previousMetrics.reduce((s, m) => s + m.clicks, 0),
    impressions: previousMetrics.reduce((s, m) => s + m.impressions, 0),
    conversions: previousMetrics.reduce((s, m) => s + m.conversions, 0),
    conversionValue: previousMetrics.reduce((s, m) => s + m.conversionValue, 0),
  };

  const avgCtr = curr.impressions > 0 ? (curr.clicks / curr.impressions) * 100 : 0;
  const avgRoas = curr.spend > 0 ? curr.conversionValue / curr.spend : 0;
  const avgCpc = curr.clicks > 0 ? curr.spend / curr.clicks : 0;

  // ── INSIGHT 1: No data at all ──
  if (currentMetrics.length === 0) {
    insights.push({
      type: "warning",
      title: "Sem dados nos últimos 30 dias",
      detail: "Não há métricas registadas. Sincroniza os dados das tuas contas de ads para ver insights.",
      action: "Vai ao Dashboard e clica em 'Sincronizar Dados'",
      priority: "high",
    });
    return NextResponse.json({ insights, period: { current: curr, previous: prev } });
  }

  // ── INSIGHT 2: MoM Spend change ──
  if (prev.spend > 0) {
    const spendChange = ((curr.spend - prev.spend) / prev.spend) * 100;
    if (spendChange > 30) {
      insights.push({
        type: "warning",
        title: `Gasto aumentou ${Math.round(spendChange)}% vs mês anterior`,
        detail: `Gastas-te €${curr.spend.toFixed(0)} este mês vs €${prev.spend.toFixed(0)} no anterior. Verifica se o aumento de budget está a gerar retorno proporcional.`,
        impact: `+€${(curr.spend - prev.spend).toFixed(0)}/mês`,
        action: "Revê as campanhas com maior aumento de gasto e verifica o ROAS individual",
        priority: "high",
      });
    } else if (spendChange < -30) {
      insights.push({
        type: "ai",
        title: `Gasto reduziu ${Math.abs(Math.round(spendChange))}% vs mês anterior`,
        detail: `Passaste de €${prev.spend.toFixed(0)} para €${curr.spend.toFixed(0)}. Se foi intencional, ótimo. Caso contrário, verifica se há campanhas pausadas por erro.`,
        priority: "medium",
      });
    }
  }

  // ── INSIGHT 3: MoM ROAS change ──
  if (prev.spend > 0 && prev.conversionValue > 0) {
    const prevRoas = prev.conversionValue / prev.spend;
    const roasChange = ((avgRoas - prevRoas) / prevRoas) * 100;
    if (roasChange < -20) {
      insights.push({
        type: "danger",
        title: `ROAS caiu ${Math.abs(Math.round(roasChange))}% este mês`,
        detail: `O retorno sobre investimento desceu de ${prevRoas.toFixed(1)}x para ${avgRoas.toFixed(1)}x. Estás a gastar mais por cada euro de receita gerada.`,
        impact: `Perda estimada: €${((prevRoas - avgRoas) * curr.spend).toFixed(0)}`,
        action: "Identifica as campanhas com pior ROAS e pausa ou otimiza os criativos",
        priority: "high",
      });
    } else if (roasChange > 20) {
      insights.push({
        type: "success",
        title: `ROAS subiu ${Math.round(roasChange)}% — bom trabalho!`,
        detail: `O retorno melhorou de ${prevRoas.toFixed(1)}x para ${avgRoas.toFixed(1)}x. As tuas otimizações estão a resultar.`,
        impact: `+€${((avgRoas - prevRoas) * curr.spend).toFixed(0)} em receita adicional`,
        priority: "low",
      });
    }
  }

  // ── INSIGHT 4: Low CTR campaigns ──
  const campaignsWithMetrics = campaigns
    .filter((c) => c.metrics.length > 0)
    .map((c) => {
      const m = c.metrics;
      const impressions = m.reduce((s, x) => s + x.impressions, 0);
      const clicks = m.reduce((s, x) => s + x.clicks, 0);
      const spend = m.reduce((s, x) => s + x.spend, 0);
      const conversions = m.reduce((s, x) => s + x.conversions, 0);
      const convValue = m.reduce((s, x) => s + x.conversionValue, 0);
      return {
        name: c.name,
        platform: c.platform,
        account: c.adAccount.accountName,
        status: c.status,
        impressions,
        clicks,
        spend,
        conversions,
        convValue,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        roas: spend > 0 ? convValue / spend : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
      };
    });

  const lowCtrCampaigns = campaignsWithMetrics.filter(
    (c) => c.impressions > 100 && c.ctr < 1
  );
  if (lowCtrCampaigns.length > 0) {
    const names = lowCtrCampaigns.slice(0, 3).map((c) => c.name).join(", ");
    const wastedSpend = lowCtrCampaigns.reduce((s, c) => s + c.spend, 0);
    insights.push({
      type: "danger",
      title: `${lowCtrCampaigns.length} campanha(s) com CTR abaixo de 1%`,
      detail: `As campanhas "${names}" têm CTR muito baixo. Os anúncios não estão a captar atenção — os criativos ou o targeting precisam de revisão.`,
      impact: `€${wastedSpend.toFixed(0)} gastos com baixo engagement`,
      action: "Testa novos criativos (imagens/copy) e refina as audiências",
      priority: "high",
    });
  }

  // ── INSIGHT 5: High CPC campaigns ──
  const highCpcCampaigns = campaignsWithMetrics.filter(
    (c) => c.clicks > 10 && c.cpc > avgCpc * 2 && avgCpc > 0
  );
  if (highCpcCampaigns.length > 0) {
    const names = highCpcCampaigns.slice(0, 3).map((c) => `${c.name} (€${c.cpc.toFixed(2)})`).join(", ");
    insights.push({
      type: "warning",
      title: `${highCpcCampaigns.length} campanha(s) com CPC acima do dobro da média`,
      detail: `${names}. O CPC médio é €${avgCpc.toFixed(2)} — estas campanhas estão a pagar muito por clique.`,
      action: "Revê o targeting, testa audiências mais amplas ou ajusta os lances",
      priority: "medium",
    });
  }

  // ── INSIGHT 6: Campaigns spending without conversions ──
  const noConvCampaigns = campaignsWithMetrics.filter(
    (c) => c.spend > 50 && c.conversions === 0
  );
  if (noConvCampaigns.length > 0) {
    const totalWasted = noConvCampaigns.reduce((s, c) => s + c.spend, 0);
    const names = noConvCampaigns.slice(0, 3).map((c) => c.name).join(", ");
    insights.push({
      type: "danger",
      title: `€${totalWasted.toFixed(0)} gastos sem nenhuma conversão`,
      detail: `As campanhas "${names}" estão a gastar budget sem gerar vendas. Possíveis causas: landing page fraca, tracking partido, ou audiência errada.`,
      impact: `€${totalWasted.toFixed(0)} potencialmente desperdiçados`,
      action: "Verifica o pixel/tracking, testa novas landing pages e revê as audiências",
      priority: "high",
    });
  }

  // ── INSIGHT 7: Top performer ──
  const topPerformer = campaignsWithMetrics
    .filter((c) => c.roas > 0)
    .sort((a, b) => b.roas - a.roas)[0];
  if (topPerformer && topPerformer.roas >= 2) {
    insights.push({
      type: "success",
      title: `"${topPerformer.name}" é a tua melhor campanha`,
      detail: `ROAS de ${topPerformer.roas.toFixed(1)}x com €${topPerformer.convValue.toFixed(0)} de receita gerada. Considera aumentar o budget desta campanha.`,
      impact: `€${topPerformer.convValue.toFixed(0)} de receita`,
      action: "Aumenta o budget diário em 20-30% e monitoriza o ROAS nos próximos 7 dias",
      priority: "medium",
    });
  }

  // ── INSIGHT 8: Overall ROAS health ──
  if (avgRoas > 0 && avgRoas < 1) {
    insights.push({
      type: "danger",
      title: "ROAS global abaixo de 1x — estás a perder dinheiro",
      detail: `Por cada €1 investido, recebes apenas €${avgRoas.toFixed(2)}. O breakeven é 1x, e o ideal para e-commerce é acima de 3x.`,
      impact: `Perda de €${(curr.spend - curr.conversionValue).toFixed(0)} este mês`,
      action: "Pausa campanhas com ROAS < 1x, concentra budget nas que convertem",
      priority: "high",
    });
  } else if (avgRoas >= 3) {
    insights.push({
      type: "success",
      title: `ROAS global de ${avgRoas.toFixed(1)}x — excelente performance`,
      detail: `Estás a gerar €${avgRoas.toFixed(2)} por cada €1 investido. Este é um indicador forte de campanhas bem otimizadas.`,
      priority: "low",
    });
  }

  // ── INSIGHT 9: Quick win — near-converting campaigns ──
  const nearConverting = campaignsWithMetrics.filter(
    (c) => c.clicks > 50 && c.conversions === 0 && c.ctr > 1.5
  );
  if (nearConverting.length > 0) {
    const names = nearConverting.slice(0, 2).map((c) => c.name).join(", ");
    insights.push({
      type: "ai",
      title: `Quick Win: "${names}" têm bom CTR mas zero conversões`,
      detail: "Estas campanhas estão a atrair cliques mas não convertem. O problema provavelmente está na landing page ou no funil pós-clique, não no anúncio.",
      action: "Otimiza as landing pages: velocidade, CTA claro, prova social, e simplifica o checkout",
      priority: "high",
    });
  }

  // ── INSIGHT 10: Platform comparison ──
  const byPlatform = new Map<string, { spend: number; convValue: number; clicks: number; impressions: number }>();
  for (const m of currentMetrics) {
    const plat = m.campaign.platform;
    const existing = byPlatform.get(plat) ?? { spend: 0, convValue: 0, clicks: 0, impressions: 0 };
    byPlatform.set(plat, {
      spend: existing.spend + m.spend,
      convValue: existing.convValue + m.conversionValue,
      clicks: existing.clicks + m.clicks,
      impressions: existing.impressions + m.impressions,
    });
  }
  if (byPlatform.size >= 2) {
    const metaData = byPlatform.get("META");
    const googleData = byPlatform.get("GOOGLE");
    if (metaData && googleData && metaData.spend > 0 && googleData.spend > 0) {
      const metaRoas = metaData.convValue / metaData.spend;
      const googleRoas = googleData.convValue / googleData.spend;
      const winner = metaRoas > googleRoas ? "Meta" : "Google";
      const loser = winner === "Meta" ? "Google" : "Meta";
      const diff = Math.abs(metaRoas - googleRoas);
      if (diff > 0.5) {
        insights.push({
          type: "ai",
          title: `${winner} Ads supera ${loser} Ads em ROAS`,
          detail: `${winner}: ${Math.max(metaRoas, googleRoas).toFixed(1)}x vs ${loser}: ${Math.min(metaRoas, googleRoas).toFixed(1)}x. Considera realocar parte do budget de ${loser} para ${winner}.`,
          action: `Move 20% do budget de ${loser} para ${winner} e avalia o impacto em 2 semanas`,
          priority: "medium",
        });
      }
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return NextResponse.json({
    insights,
    period: { current: curr, previous: prev },
  });
}
