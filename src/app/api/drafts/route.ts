import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drafts = await prisma.draftCampaign.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drafts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Support bulk creation — body can be an array
  const items = Array.isArray(body) ? body : [body];

  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.draftCampaign.create({
        data: {
          userId: session.user!.id!,
          platform: item.platform,
          name: item.name,
          objective: item.objective,
          targetingConfig: item.targeting ?? Prisma.JsonNull,
          budgetConfig: item.budget
            ? { dailyBudget: item.budget, currency: item.currency ?? "EUR" }
            : Prisma.JsonNull,
          creativeConfig: item.creative ?? Prisma.JsonNull,
          status: "PENDING_REVIEW",
        },
      })
    )
  );

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ids, action } = body as { ids: string[]; action: "approve" | "reject" };

  if (!ids?.length || !action) {
    return NextResponse.json({ error: "ids and action required" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  await prisma.draftCampaign.updateMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
    data: { status: newStatus },
  });

  return NextResponse.json({ updated: ids.length, status: newStatus });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.draftCampaign.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}
