export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidSemver, compareSemver } from "@/lib/semver";

/**
 * GET /api/skills/[slug]/versions
 * Public: list all versions for a skill (newest first).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const skill = await prisma.publishedSkill.findFirst({
    where: { name: params.slug, status: "approved" },
    select: { id: true, version: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const versions = await prisma.skillVersion.findMany({
    where: { skillId: skill.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, version: true, changelog: true, files: true, createdAt: true },
  });

  return NextResponse.json({ currentVersion: skill.version, versions });
}

/**
 * POST /api/skills/[slug]/versions
 * Author-only: publish a new version.
 * Body: { version, changelog?, files? }
 */
export async function POST(
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
  const { version, changelog, files } = body;

  // Validate version
  if (!version || typeof version !== "string") {
    return NextResponse.json({ error: "Version is required" }, { status: 400 });
  }
  if (!isValidSemver(version)) {
    return NextResponse.json({ error: "Invalid semver format. Use MAJOR.MINOR.PATCH (e.g. 1.2.0)" }, { status: 400 });
  }

  // Check version is newer than current
  const cmp = compareSemver(version, skill.version);
  if (cmp !== null && cmp <= 0) {
    return NextResponse.json({
      error: `New version (${version}) must be greater than current version (${skill.version})`,
    }, { status: 400 });
  }

  // Check for duplicate version
  const existing = await prisma.skillVersion.findUnique({
    where: { skillId_version: { skillId: skill.id, version } },
  });
  if (existing) {
    return NextResponse.json({ error: `Version ${version} already exists` }, { status: 409 });
  }

  // Archive current version if no version record exists for it yet
  const currentVersionRecord = await prisma.skillVersion.findUnique({
    where: { skillId_version: { skillId: skill.id, version: skill.version } },
  });
  if (!currentVersionRecord) {
    await prisma.skillVersion.create({
      data: {
        skillId: skill.id,
        version: skill.version,
        changelog: "Initial release",
        createdAt: skill.createdAt,
      },
    });
  }

  // Create new version record + update skill's current version
  const [newVersion] = await prisma.$transaction([
    prisma.skillVersion.create({
      data: {
        skillId: skill.id,
        version,
        changelog: changelog || null,
        files: files ? JSON.stringify(files) : null,
      },
    }),
    prisma.publishedSkill.update({
      where: { id: skill.id },
      data: { version },
    }),
  ]);

  return NextResponse.json({ version: newVersion }, { status: 201 });
}
