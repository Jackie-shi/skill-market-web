import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/skills/[slug]/reviews — list reviews for a skill
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const skill = await prisma.publishedSkill.findUnique({
    where: { name: params.slug },
    select: { id: true, averageRating: true, reviewCount: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: { skillId: skill.id },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    averageRating: skill.averageRating,
    reviewCount: skill.reviewCount,
    reviews,
  });
}

// POST /api/skills/[slug]/reviews — submit a review
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const skill = await prisma.publishedSkill.findUnique({
    where: { name: params.slug },
    select: { id: true, authorId: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Must have purchased/downloaded (free skills count as $0 purchase, or check downloads)
  const hasPurchased = await prisma.purchase.findFirst({
    where: { userId, skillId: skill.id, status: "completed" },
  });

  // For free skills, also check download records (downloads table doesn't exist yet,
  // so for now we allow free skill reviews if status=approved)
  const isFreeSkill = await prisma.publishedSkill.findFirst({
    where: { id: skill.id, pricingModel: "free" },
  });

  if (!hasPurchased && !isFreeSkill) {
    return NextResponse.json(
      { error: "You must purchase this skill before reviewing" },
      { status: 403 }
    );
  }

  // Can't review your own skill
  if (skill.authorId === userId) {
    return NextResponse.json(
      { error: "You cannot review your own skill" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const rating = Number(body.rating);
  const comment = (body.comment as string)?.trim() || null;

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  if (comment && comment.length > 2000) {
    return NextResponse.json(
      { error: "Comment must be 2000 characters or less" },
      { status: 400 }
    );
  }

  // Check if already reviewed (upsert to allow editing)
  const existing = await prisma.review.findUnique({
    where: { userId_skillId: { userId, skillId: skill.id } },
  });

  let review;
  if (existing) {
    review = await prisma.review.update({
      where: { id: existing.id },
      data: { rating, comment },
    });
  } else {
    review = await prisma.review.create({
      data: { rating, comment, userId, skillId: skill.id },
    });
  }

  // Recalculate average rating
  const agg = await prisma.review.aggregate({
    where: { skillId: skill.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.publishedSkill.update({
    where: { id: skill.id },
    data: {
      averageRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewCount: agg._count.rating,
    },
  });

  return NextResponse.json(review, { status: existing ? 200 : 201 });
}
