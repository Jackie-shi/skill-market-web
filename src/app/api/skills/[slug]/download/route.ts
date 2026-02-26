import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackDownload, getDownloadCount } from "@/lib/downloads";

export const dynamic = "force-dynamic";

/**
 * GET /api/skills/[slug]/download
 *
 * Free skills: returns download instructions immediately.
 * Paid skills: checks DB for a completed purchase before unlocking.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const skill = await prisma.publishedSkill.findFirst({
    where: { name: params.slug, status: "approved" },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "cli";
  const platforms: string[] = skill.platforms ? JSON.parse(skill.platforms) : [];

  // Paid skill gate — verify purchase in DB
  if (skill.pricingModel === "paid") {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Login required to download paid skills", loginUrl: "/auth/signin" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;
    const purchase = await prisma.purchase.findFirst({
      where: { userId, skillId: skill.id, status: "completed" },
    });
    if (!purchase) {
      return NextResponse.json(
        {
          error: "Payment required",
          pricing: { model: skill.pricingModel, price: skill.price, currency: skill.currency },
          checkoutUrl: `/api/checkout`,
        },
        { status: 402 }
      );
    }
  }

  // Track download & increment DB counter
  trackDownload(params.slug);
  await prisma.publishedSkill.update({
    where: { id: skill.id },
    data: { downloads: { increment: 1 } },
  });
  const totalDownloads = getDownloadCount(params.slug);

  const installInfo = generateInstallInfo(skill.name, format, platforms);

  return NextResponse.json({
    skill: skill.name,
    version: skill.version,
    format,
    totalDownloads,
    install: installInfo,
  });
}

export async function HEAD(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const count = getDownloadCount(params.slug);
  return new NextResponse(null, {
    headers: { "X-Download-Count": String(count) },
  });
}

function generateInstallInfo(name: string, format: string, platforms: string[]) {
  const isOpenClaw = platforms.includes("openclaw");
  const isClaudeCode = platforms.includes("claude-code");

  switch (format) {
    case "zip":
      return {
        method: "zip",
        url: `/api/skills/${name}/archive?format=zip`,
        instructions: [
          "Download the zip file",
          isOpenClaw ? `Extract to ~/.agents/skills/${name}/` : "Extract to your project's skills folder",
          "Restart your AI tool to pick up the new skill",
        ],
      };
    case "git":
      return {
        method: "git",
        command: `git clone https://clawhub.com/skills/${name}.git`,
        instructions: [
          `git clone https://clawhub.com/skills/${name}.git`,
          isOpenClaw ? `mv ${name} ~/.agents/skills/${name}` : "Move the cloned directory to your skills folder",
          "Restart your AI tool to pick up the new skill",
        ],
      };
    case "cli":
    default:
      return {
        method: "cli",
        commands: {
          ...(isOpenClaw && { openclaw: `clawhub install ${name}` }),
          ...(isClaudeCode && { "claude-code": `npx clawhub install ${name}` }),
          generic: `npx clawhub install ${name}`,
        },
        instructions: [
          isOpenClaw ? `Run: clawhub install ${name}` : `Run: npx clawhub install ${name}`,
          "The skill will be downloaded and placed in the correct directory",
          "It's ready to use immediately — no restart needed",
        ],
      };
  }
}
