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

  const userId = session.user.id;

  const [user, skills, purchases] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        createdAt: true,
      },
    }),
    prisma.publishedSkill.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        displayName: true,
        downloads: true,
        status: true,
        price: true,
        pricingModel: true,
      },
    }),
    prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { skill: { select: { displayName: true } } },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Compute stats
  const allSkills = await prisma.publishedSkill.findMany({
    where: { authorId: userId },
    select: { downloads: true, price: true },
  });

  const allSales = await prisma.purchase.findMany({
    where: { skill: { authorId: userId } },
    select: { amount: true },
  });

  const stats = {
    publishedSkills: allSkills.length,
    totalDownloads: allSkills.reduce((sum, s) => sum + s.downloads, 0),
    totalPurchases: purchases.length,
    totalEarnings: allSales.reduce((sum, p) => sum + p.amount * 0.85, 0), // 85% after 15% commission
  };

  return NextResponse.json({
    user,
    stats,
    recentSkills: skills,
    recentPurchases: purchases,
  });
}
