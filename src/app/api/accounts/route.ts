import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.adAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      platformAccountId: true,
      accountName: true,
      currency: true,
      isActive: true,
      _count: { select: { campaigns: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(accounts);
}
