import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, toCents, calculateSplit } from "@/lib/stripe";

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for purchasing a paid skill.
 *
 * Body: { skillId: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { skillId } = await req.json();
  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  // Load skill
  const skill = await prisma.publishedSkill.findUnique({
    where: { id: skillId },
    include: { author: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  if (skill.pricingModel === "free" || skill.price === 0) {
    return NextResponse.json({ error: "Skill is free — no checkout needed" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  // Check if already purchased
  const existing = await prisma.purchase.findFirst({
    where: { userId, skillId, status: "completed" },
  });
  if (existing) {
    return NextResponse.json({ error: "Already purchased", purchaseId: existing.id }, { status: 409 });
  }

  // Ensure user has a Stripe customer ID
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });
    user = { ...user, stripeCustomerId: customer.id };
  }

  const { platformFee, creatorPayout } = calculateSplit(skill.price);

  // Build Checkout Session params
  const checkoutParams: any = {
    mode: "payment",
    customer: user.stripeCustomerId!,
    line_items: [
      {
        price_data: {
          currency: skill.currency.toLowerCase(),
          product_data: {
            name: skill.displayName,
            description: `AI Skill: ${skill.description}`.slice(0, 500),
          },
          unit_amount: toCents(skill.price),
        },
        quantity: 1,
      },
    ],
    metadata: {
      skillId: skill.id,
      userId,
      platformFee: platformFee.toString(),
      creatorPayout: creatorPayout.toString(),
    },
    success_url: `${req.nextUrl.origin}/skills/${skill.name}?purchased=true`,
    cancel_url: `${req.nextUrl.origin}/skills/${skill.name}`,
  };

  // If creator has Stripe Connect, use application_fee for direct split
  if (skill.author.stripeConnectId && skill.author.stripeConnectOnboarded) {
    checkoutParams.payment_intent_data = {
      application_fee_amount: toCents(platformFee),
      transfer_data: {
        destination: skill.author.stripeConnectId,
      },
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

  // Create pending purchase record
  await prisma.purchase.create({
    data: {
      userId,
      skillId: skill.id,
      amount: skill.price,
      currency: skill.currency,
      status: "pending",
      stripeSessionId: checkoutSession.id,
      platformFee,
      creatorPayout,
    },
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
