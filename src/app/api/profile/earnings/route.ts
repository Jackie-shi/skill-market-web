export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const COMMISSION_RATE = 15;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sales = await prisma.purchase.findMany({
    where: { skill: { authorId: session.user.id }, status: "completed" },
    orderBy: { createdAt: "desc" },
    include: {
      skill: { select: { displayName: true } },
      user: { select: { name: true } },
    },
  });

  // Use actual creatorPayout if available, fall back to calculated
  const totalEarnings = sales.reduce(
    (sum, s) => sum + (s.creatorPayout ?? s.amount * (1 - COMMISSION_RATE / 100)),
    0
  );

  return NextResponse.json({
    totalEarnings,
    totalSales: sales.length,
    commissionRate: COMMISSION_RATE,
    sales,
  });
}
