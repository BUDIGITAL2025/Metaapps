import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface CategoryScore {
  name: string;
  score: number;
  max: number;
  detail: string;
}

function getGrade(score: number): { letter: string; color: string } {
  if (score >= 90) return { letter: "A+", color: "#16a34a" };
  if (score >= 80) return { letter: "A", color: "#22c55e" };
  if (score >= 70) return { letter: "B", color: "#84cc16" };
  if (score >= 60) return { letter: "C+", color: "#D97706" };
  if (score >= 50) return { letter: "C", color: "#ea580c" };
  if (score >= 40) return { letter: "D", color: "#dc2626" };
  return { letter: "F", color: "#991b1b" };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all user data
  const [campaigns, metrics, adAccounts] = await Promise.all([
    prisma.campaign.findMany({
      where: { adAccount: { userId: session.user.id } },
      select: { id: true, status: true, platform: true, dailyBudget: true },
    }),
    prisma.campaignMetrics.findMany({
      where: {
        date: { gte: thirtyDaysAgo },
        campaign: { adAccount: { userId: session.user.id } },
      },
      select: {
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true,
        conversionValue: true,
        ctr: true,
        cpc: true,
        roas: true,
      },
    }),
    prisma.adAccount.findMany({
      where: { userId: session.user.id, isActive: true },
      select: { platform: true },
    }),
  ]);

  const totalSpend = metrics.reduce((s, m) => s + m.spend, 0);
  const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
  const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0);
  const totalConversions = metrics.reduce((s, m) => s + m.conversions, 0);
  const totalConversionValue = metrics.reduce((s, m) => s + m.conversionValue, 0);

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgRoas = totalSpend > 0 ? totalConversionValue / totalSpend : 0;
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalCampaigns = campaigns.length;
  const platforms = new Set(adAccounts.map((a) => a.platform)).size;

  const categories: CategoryScore[] = [];

  // 1. CTR Performance (max 20)
  let ctrScore = 0;
  let ctrDetail = "";
  if (avgCtr >= 3) { ctrScore = 20; ctrDetail = "Excelente CTR"; }
  else if (avgCtr >= 2) { ctrScore = 16; ctrDetail = "Bom CTR"; }
  else if (avgCtr >= 1) { ctrScore = 10; ctrDetail = "CTR abaixo da média"; }
  else if (avgCtr > 0) { ctrScore = 5; ctrDetail = "CTR muito baixo — revê os criativos"; }
  else { ctrScore = 0; ctrDetail = "Sem dados de CTR"; }
  categories.push({ name: "CTR Performance", score: ctrScore, max: 20, detail: ctrDetail });

  // 2. ROAS / Retorno (max 25)
  let roasScore = 0;
  let roasDetail = "";
  if (avgRoas >= 5) { roasScore = 25; roasDetail = "ROAS excepcional"; }
  else if (avgRoas >= 3) { roasScore = 20; roasDetail = "Bom retorno sobre investimento"; }
  else if (avgRoas >= 2) { roasScore = 15; roasDetail = "ROAS aceitável — margem para melhorar"; }
  else if (avgRoas >= 1) { roasScore = 8; roasDetail = "ROAS baixo — estás a perder margem"; }
  else if (avgRoas > 0) { roasScore = 3; roasDetail = "ROAS crítico — gastas mais do que recebes"; }
  else { roasScore = 0; roasDetail = "Sem dados de conversão"; }
  categories.push({ name: "Retorno (ROAS)", score: roasScore, max: 25, detail: roasDetail });

  // 3. Conversion Rate (max 20)
  let convScore = 0;
  let convDetail = "";
  if (convRate >= 5) { convScore = 20; convDetail = "Taxa de conversão forte"; }
  else if (convRate >= 3) { convScore = 15; convDetail = "Boa taxa de conversão"; }
  else if (convRate >= 1) { convScore = 10; convDetail = "Taxa de conversão média"; }
  else if (convRate > 0) { convScore = 5; convDetail = "Taxa de conversão baixa — revê landing pages"; }
  else { convScore = 0; convDetail = "Sem conversões registadas"; }
  categories.push({ name: "Conversões", score: convScore, max: 20, detail: convDetail });

  // 4. Campaign Activity (max 15)
  let activityScore = 0;
  let activityDetail = "";
  if (totalCampaigns === 0) {
    activityScore = 0;
    activityDetail = "Sem campanhas — conecta contas e sincroniza";
  } else {
    const activeRatio = activeCampaigns / totalCampaigns;
    if (activeRatio >= 0.5) { activityScore = 15; activityDetail = `${activeCampaigns}/${totalCampaigns} campanhas ativas`; }
    else if (activeRatio >= 0.2) { activityScore = 10; activityDetail = `Poucas campanhas ativas (${activeCampaigns}/${totalCampaigns})`; }
    else { activityScore = 5; activityDetail = "Maioria das campanhas pausadas"; }
  }
  categories.push({ name: "Atividade", score: activityScore, max: 15, detail: activityDetail });

  // 5. Efficiency (CPC) (max 10)
  let cpcScore = 0;
  let cpcDetail = "";
  if (avgCpc === 0) { cpcScore = 0; cpcDetail = "Sem dados de CPC"; }
  else if (avgCpc <= 0.5) { cpcScore = 10; cpcDetail = "CPC muito eficiente"; }
  else if (avgCpc <= 1) { cpcScore = 8; cpcDetail = "CPC bom"; }
  else if (avgCpc <= 2) { cpcScore = 5; cpcDetail = "CPC aceitável"; }
  else { cpcScore = 3; cpcDetail = "CPC alto — otimiza targeting"; }
  categories.push({ name: "Eficiência (CPC)", score: cpcScore, max: 10, detail: cpcDetail });

  // 6. Platform Diversification (max 10)
  let platScore = 0;
  let platDetail = "";
  if (platforms >= 2) { platScore = 10; platDetail = "Diversificado em múltiplas plataformas"; }
  else if (platforms === 1) { platScore = 5; platDetail = "Apenas 1 plataforma — diversifica para reduzir risco"; }
  else { platScore = 0; platDetail = "Sem plataformas conectadas"; }
  categories.push({ name: "Diversificação", score: platScore, max: 10, detail: platDetail });

  const totalScore = categories.reduce((s, c) => s + c.score, 0);
  const grade = getGrade(totalScore);

  return NextResponse.json({
    score: Math.round(totalScore * 10) / 10,
    grade: grade.letter,
    gradeColor: grade.color,
    categories,
    summary: {
      totalSpend: Math.round(totalSpend * 100) / 100,
      avgCtr: Math.round(avgCtr * 100) / 100,
      avgRoas: Math.round(avgRoas * 100) / 100,
      totalConversions,
      activeCampaigns,
      totalCampaigns,
      platforms,
    },
  });
}
