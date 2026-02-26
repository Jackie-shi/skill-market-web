export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const range = req.nextUrl.searchParams.get("range") || "30"; // days
  const days = parseInt(range, 10);
  const since = new Date(Date.now() - days * 86400000);

  // 1. Registration trend (daily)
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const registrationsByDay: Record<string, number> = {};
  for (const u of users) {
    const day = u.createdAt.toISOString().slice(0, 10);
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
  }
  const registrationTrend = Object.entries(registrationsByDay).map(([date, count]) => ({ date, count }));

  // 2. Top 10 downloaded skills
  const topSkills = await prisma.publishedSkill.findMany({
    where: { status: "approved" },
    orderBy: { downloads: "desc" },
    take: 10,
    select: { displayName: true, downloads: true, category: true, pricingModel: true },
  });

  // 3. Conversion funnel
  const totalUsers = await prisma.user.count();
  const usersWithSkills = await prisma.user.count({
    where: { publishedSkills: { some: {} } },
  });
  const usersWithPurchases = await prisma.user.count({
    where: { purchases: { some: { status: "completed" } } },
  });
  const totalVisitors = totalUsers * 5; // estimate: 5x visitors per registered user (placeholder)

  const funnel = [
    { stage: "访问 (估算)", value: totalVisitors },
    { stage: "注册", value: totalUsers },
    { stage: "上架 Skill", value: usersWithSkills },
    { stage: "购买", value: usersWithPurchases },
  ];

  // 4. Creator activity
  const creators = await prisma.user.findMany({
    where: { publishedSkills: { some: {} } },
    select: {
      id: true,
      name: true,
      email: true,
      publishedSkills: {
        select: { id: true, updatedAt: true, status: true },
      },
    },
  });

  const creatorActivity = creators.map((c) => ({
    name: c.name || c.email || c.id.slice(0, 8),
    totalSkills: c.publishedSkills.length,
    approvedSkills: c.publishedSkills.filter((s) => s.status === "approved").length,
    lastUpdate: c.publishedSkills.reduce(
      (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
      new Date(0)
    ),
  }));

  // 5. Revenue stats
  const completedPurchases = await prisma.purchase.findMany({
    where: { status: "completed", createdAt: { gte: since } },
    select: { amount: true, platformFee: true, creatorPayout: true, createdAt: true },
  });

  const gmv = completedPurchases.reduce((s, p) => s + p.amount, 0);
  const platformFees = completedPurchases.reduce((s, p) => s + (p.platformFee || 0), 0);
  const creatorPayouts = completedPurchases.reduce((s, p) => s + (p.creatorPayout || 0), 0);

  // Revenue by day
  const revenueByDay: Record<string, { gmv: number; fee: number; payout: number }> = {};
  for (const p of completedPurchases) {
    const day = p.createdAt.toISOString().slice(0, 10);
    if (!revenueByDay[day]) revenueByDay[day] = { gmv: 0, fee: 0, payout: 0 };
    revenueByDay[day].gmv += p.amount;
    revenueByDay[day].fee += p.platformFee || 0;
    revenueByDay[day].payout += p.creatorPayout || 0;
  }
  const revenueTrend = Object.entries(revenueByDay).map(([date, v]) => ({ date, ...v }));

  // 6. Summary stats
  const totalSkills = await prisma.publishedSkill.count({ where: { status: "approved" } });
  const pendingReviews = await prisma.publishedSkill.count({ where: { status: "pending" } });

  return NextResponse.json({
    summary: {
      totalUsers,
      totalSkills,
      pendingReviews,
      gmv: Math.round(gmv * 100) / 100,
      platformFees: Math.round(platformFees * 100) / 100,
      creatorPayouts: Math.round(creatorPayouts * 100) / 100,
      totalPurchases: completedPurchases.length,
    },
    registrationTrend,
    topSkills,
    funnel,
    creatorActivity,
    revenueTrend,
  });
}
