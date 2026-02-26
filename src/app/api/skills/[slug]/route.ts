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

  return NextResponse.json({ skill });
}
