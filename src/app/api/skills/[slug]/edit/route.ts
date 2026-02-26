export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skill = await prisma.publishedSkill.findFirst({
    where: { name: params.slug, authorId: session.user.id },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found or not owned by you" }, { status: 404 });
  }

  return NextResponse.json({ skill });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skill = await prisma.publishedSkill.findFirst({
    where: { name: params.slug, authorId: session.user.id },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found or not owned by you" }, { status: 404 });
  }

  const body = await req.json();
  const {
    displayName,
    description,
    longDescription,
    version,
    category,
    pricingModel,
    price,
    platforms,
    osTargets,
    keywords,
    license,
    repository,
  } = body;

  // Validation
  if (displayName !== undefined && !displayName) {
    return NextResponse.json({ error: "Display name cannot be empty" }, { status: 400 });
  }
  if (description !== undefined && !description) {
    return NextResponse.json({ error: "Description cannot be empty" }, { status: 400 });
  }
  if (platforms !== undefined && (!Array.isArray(platforms) || platforms.length === 0)) {
    return NextResponse.json({ error: "At least one platform is required" }, { status: 400 });
  }
  if ((pricingModel === "paid" || pricingModel === "freemium") && (!price || price < 0.99)) {
    return NextResponse.json({ error: "Price must be at least $0.99 for paid skills" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (displayName !== undefined) updateData.displayName = displayName;
  if (description !== undefined) updateData.description = description;
  if (longDescription !== undefined) updateData.longDescription = longDescription || null;
  if (version !== undefined) updateData.version = version;
  if (category !== undefined) updateData.category = category;
  if (pricingModel !== undefined) updateData.pricingModel = pricingModel;
  if (price !== undefined) updateData.price = (pricingModel === "free" || pricingModel === "donation") ? 0 : (price || 0);
  if (platforms !== undefined) updateData.platforms = JSON.stringify(platforms);
  if (osTargets !== undefined) updateData.osTargets = osTargets?.length ? JSON.stringify(osTargets) : null;
  if (keywords !== undefined) updateData.keywords = keywords?.length ? JSON.stringify(keywords) : null;
  if (license !== undefined) updateData.license = license;
  if (repository !== undefined) updateData.repository = repository || null;

  // If skill was approved, editing sends it back for re-review
  if (skill.status === "approved" && Object.keys(updateData).length > 0) {
    updateData.status = "pending";
    updateData.reviewNote = null;
    updateData.reviewedAt = null;
  }

  const updated = await prisma.publishedSkill.update({
    where: { id: skill.id },
    data: updateData,
  });

  return NextResponse.json({ skill: updated });
}
