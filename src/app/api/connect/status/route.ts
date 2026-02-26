import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/connect/status
 * Returns the creator's Stripe Connect onboarding status.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeConnectId: true, stripeConnectOnboarded: true },
  });

  return NextResponse.json({
    connected: !!user?.stripeConnectId,
    onboarded: user?.stripeConnectOnboarded ?? false,
  });
}
