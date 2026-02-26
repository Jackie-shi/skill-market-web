export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const skill = await prisma.publishedSkill.findFirst({
    where: { name: params.slug, status: "approved" },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true, githubUrl: true, websiteUrl: true } },
    },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Related skills: same category, exclude current, max 4
  const relatedSkills = await prisma.publishedSkill.findMany({
    where: { category: skill.category, status: "approved", id: { not: skill.id } },
    take: 4,
    orderBy: { downloads: "desc" },
    select: { name: true, displayName: true, description: true, category: true, pricingModel: true, price: true, currency: true, downloads: true, averageRating: true, reviewCount: true, platforms: true },
  });

  // Author skill count
  const authorSkillCount = await prisma.publishedSkill.count({
    where: { authorId: skill.authorId, status: "approved" },
  });

  return NextResponse.json(
    { skill, relatedSkills, authorSkillCount },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
  );
}
