export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevance";
  const featured = searchParams.get("featured"); // "true" to filter featured only

  // Only show approved skills
  const where: any = { status: "approved" };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { keywords: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { downloads: "desc" };
  switch (sort) {
    case "newest": orderBy = { createdAt: "desc" }; break;
    case "updated": orderBy = { updatedAt: "desc" }; break;
    case "downloads": orderBy = { downloads: "desc" }; break;
    case "rating": orderBy = { averageRating: "desc" }; break;
  }

  const skills = await prisma.publishedSkill.findMany({
    where,
    orderBy,
    include: { author: { select: { name: true, image: true } } },
  });

  // Category counts (always for approved skills)
  const categoryCounts = await prisma.publishedSkill.groupBy({
    by: ["category"],
    where: { status: "approved" },
    _count: { category: true },
  });

  const categoryCountMap: Record<string, number> = {};
  for (const c of categoryCounts) {
    categoryCountMap[c.category] = c._count.category;
  }

  return NextResponse.json({ skills, categoryCounts: categoryCountMap });
}
