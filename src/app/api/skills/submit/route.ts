export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateSubmission } from "@/lib/skill-validator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
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

  // Basic required field check
  if (!name || !displayName || !description || !version || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json({ error: "At least one platform is required" }, { status: 400 });
  }

  // ── Quality validation ──
  const validation = validateSubmission(body);
  if (!validation.passed) {
    return NextResponse.json(
      {
        error: "Quality check failed",
        details: validation.errors.map((e) => ({
          code: e.code,
          message: e.message,
          field: e.field,
        })),
        warnings: validation.warnings.map((w) => ({
          code: w.code,
          message: w.message,
          field: w.field,
        })),
      },
      { status: 422 }
    );
  }

  // Pricing validation
  if ((pricingModel === "paid" || pricingModel === "freemium") && (!price || price < 0.99)) {
    return NextResponse.json({ error: "Price must be at least $0.99 for paid skills" }, { status: 400 });
  }

  // Check duplicate name
  const existing = await prisma.publishedSkill.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "A skill with this name already exists" }, { status: 409 });
  }

  const skill = await prisma.publishedSkill.create({
    data: {
      name,
      displayName,
      description,
      longDescription: longDescription || null,
      version,
      category,
      pricingModel: pricingModel || "free",
      price: pricingModel === "free" || pricingModel === "donation" ? 0 : (price || 0),
      platforms: JSON.stringify(platforms),
      osTargets: osTargets?.length ? JSON.stringify(osTargets) : null,
      keywords: keywords?.length ? JSON.stringify(keywords) : null,
      license: license || "MIT",
      repository: repository || null,
      status: "pending",
      authorId: session.user.id,
    },
  });

  // Include warnings in successful response
  const response: Record<string, unknown> = { skill };
  if (validation.warnings.length > 0) {
    response.warnings = validation.warnings.map((w) => ({
      code: w.code,
      message: w.message,
      field: w.field,
    }));
  }

  return NextResponse.json(response, { status: 201 });
}
