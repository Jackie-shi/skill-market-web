import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/connect/onboard
 * Creates or retrieves a Stripe Connect account for the creator,
 * then returns an Account Link URL to complete onboarding.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create Connect account if not exists
  if (!user.stripeConnectId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      metadata: { userId: user.id },
      capabilities: {
        transfers: { requested: true },
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { stripeConnectId: account.id },
    });
    user = { ...user, stripeConnectId: account.id };
  }

  // Create Account Link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: user.stripeConnectId!,
    refresh_url: `${req.nextUrl.origin}/profile/earnings?connect=refresh`,
    return_url: `${req.nextUrl.origin}/profile/earnings?connect=complete`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
