export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/skills/[slug]/toggle-status
 * Toggle between approved (live) and delisted status for a creator's own skill.
 */
export async function POST(
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

  // Only approved skills can be delisted, and delisted can be relisted
  if (skill.status !== "approved" && skill.status !== "delisted") {
    return NextResponse.json({ error: "Can only toggle status for approved or delisted skills" }, { status: 400 });
  }

  const newStatus = skill.status === "approved" ? "delisted" : "approved";
  const updated = await prisma.publishedSkill.update({
    where: { id: skill.id },
    data: { status: newStatus },
  });

  return NextResponse.json({ skill: updated, message: newStatus === "delisted" ? "Skill delisted" : "Skill relisted" });
}
