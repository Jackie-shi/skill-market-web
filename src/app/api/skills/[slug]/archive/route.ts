import { NextRequest, NextResponse } from "next/server";
import { getSkillBySlug } from "@/lib/mock-data";
import { trackDownload } from "@/lib/downloads";

/**
 * GET /api/skills/[slug]/archive?format=zip
 *
 * Returns a downloadable ZIP archive of the skill.
 * MVP: generates a minimal placeholder zip with SKILL.md + skill.json.
 * Production: serve pre-built archives from object storage.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const skill = getSkillBySlug(params.slug);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Check paid gate
  if (skill.pricing.model === "paid") {
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
  // Production: stream actual zip from S3/R2
  const manifest = {
    name: skill.name,
    version: skill.version,
    displayName: skill.displayName,
    description: skill.description,
    author: skill.author,
    compatibility: skill.compatibility,
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
