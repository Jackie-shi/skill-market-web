export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skills = await prisma.publishedSkill.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate stats
  const totalDownloads = skills.reduce((sum, s) => sum + s.downloads, 0);
  const totalSkills = skills.length;
  const liveSkills = skills.filter((s) => s.status === "approved").length;

  // Earnings from purchases
  const purchases = await prisma.purchase.findMany({
    where: {
      skill: { authorId: session.user.id },
      status: "completed",
    },
    include: { skill: { select: { name: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalEarnings = purchases.reduce((sum, p) => sum + (p.creatorPayout || 0), 0);

  // Per-skill breakdown
  const skillStats = skills.map((s) => {
    const skillPurchases = purchases.filter((p) => p.skillId === s.id);
    const earnings = skillPurchases.reduce((sum, p) => sum + (p.creatorPayout || 0), 0);
    return {
      id: s.id,
      name: s.name,
      displayName: s.displayName,
      status: s.status,
      downloads: s.downloads,
      earnings,
      pricingModel: s.pricingModel,
      price: s.price,
      averageRating: s.averageRating,
      reviewCount: s.reviewCount,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  });

  return NextResponse.json({
    overview: {
      totalSkills,
      liveSkills,
      totalDownloads,
      totalEarnings,
      totalPurchases: purchases.length,
    },
    skills: skillStats,
  });
}
