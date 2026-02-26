import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackDownload } from "@/lib/downloads";

export const dynamic = "force-dynamic";

/**
 * GET /api/skills/[slug]/archive?format=zip
 *
 * Returns a downloadable archive of the skill.
 * MVP: generates a minimal placeholder JSON manifest.
 * Production: serve pre-built archives from object storage.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const skill = await prisma.publishedSkill.findFirst({
    where: { name: params.slug, status: "approved" },
    include: { author: { select: { name: true } } },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Check paid gate
  if (skill.pricingModel === "paid") {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Payment required", checkoutUrl: `/skills/${skill.name}?checkout=true` },
        { status: 402 }
      );
    }
  }

  trackDownload(params.slug);

  // MVP: return a JSON manifest as downloadable file
  const manifest = {
    name: skill.name,
    version: skill.version,
    displayName: skill.displayName,
    description: skill.description,
    author: { name: skill.author?.name ?? "Unknown" },
    compatibility: {
      platforms: skill.platforms ? JSON.parse(skill.platforms) : [],
    },
    install: `clawhub install ${skill.name}`,
    note: "Full ZIP archives available after storage integration. Use CLI install for now.",
  };

  const body = JSON.stringify(manifest, null, 2);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${skill.name}-${skill.version}.json"`,
      "X-Archive-Note": "MVP placeholder — use clawhub install for full skill download",
    },
  });
}
