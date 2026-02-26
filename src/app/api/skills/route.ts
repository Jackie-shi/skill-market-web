export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevance";

  // Only show approved skills
  const where: any = { status: "approved" };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { displayName: { contains: q } },
      { description: { contains: q } },
      { keywords: { contains: q } },
      { name: { contains: q } },
    ];
  }

  let orderBy: any = { downloads: "desc" };
  switch (sort) {
    case "newest": orderBy = { createdAt: "desc" }; break;
    case "updated": orderBy = { updatedAt: "desc" }; break;
    case "downloads": orderBy = { downloads: "desc" }; break;
  }

  const skills = await prisma.publishedSkill.findMany({
    where,
    orderBy,
    include: { author: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ skills });
}
