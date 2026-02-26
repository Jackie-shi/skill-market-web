import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for payment lifecycle.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.purchase.updateMany({
        where: { stripeSessionId: session.id, status: "pending" },
        data: { status: "failed" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        await prisma.purchase.updateMany({
          where: { stripePaymentIntent: charge.payment_intent as string },
          data: { status: "refunded" },
        });
      }
      break;
    }

    case "account.updated": {
      // Stripe Connect account status change
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.details_submitted) {
        await prisma.user.updateMany({
          where: { stripeConnectId: account.id },
          data: { stripeConnectOnboarded: true },
        });
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const purchase = await prisma.purchase.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (!purchase) {
    console.error("No purchase found for session:", session.id);
    return;
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "completed",
      stripePaymentIntent: session.payment_intent as string | null,
    },
  });

  // Increment download count on the skill
  await prisma.publishedSkill.update({
    where: { id: purchase.skillId },
    data: { downloads: { increment: 1 } },
  });
}
