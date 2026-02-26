import Stripe from "stripe";

/** Platform commission rate: 15% */
export const PLATFORM_FEE_PERCENT = 15;

let _stripe: Stripe | null = null;

/** Lazily initialize Stripe to avoid build-time errors when env vars are missing */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead — kept for convenience in simple cases */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

/** Calculate platform fee and creator payout from a price in USD */
export function calculateSplit(priceUsd: number) {
  const platformFee = Math.round(priceUsd * PLATFORM_FEE_PERCENT) / 100;
  const creatorPayout = priceUsd - platformFee;
  return { platformFee, creatorPayout };
}

/** Convert USD dollars to Stripe cents */
export function toCents(usd: number): number {
  return Math.round(usd * 100);
}
