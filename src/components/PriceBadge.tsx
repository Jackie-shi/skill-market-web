import { SkillPricing } from "@/lib/types";

export default function PriceBadge({ pricing }: { pricing: SkillPricing }) {
  switch (pricing.model) {
    case "free":
      return <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Free</span>;
    case "paid":
      return <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">${pricing.price}</span>;
    case "freemium":
      return <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">Freemium</span>;
    case "donation":
      return <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-medium text-pink-400">Donation</span>;
  }
}
