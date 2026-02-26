"use client";
import Link from "next/link";

const PERKS = [
  { icon: "💰", title: "0% Platform Fee", desc: "Keep 100% of your earnings for 6 months (normally 15%)" },
  { icon: "⚡", title: "Priority Review", desc: "Your skills reviewed within 24 hours" },
  { icon: "📌", title: "Homepage Featured", desc: "Early Creator section with top placement" },
  { icon: "🌟", title: "Founding Badge", desc: "Exclusive 'Founding Creator' badge on your profile" },
  { icon: "🗳️", title: "Roadmap Voting", desc: "Shape the platform's future with voting rights" },
  { icon: "🔗", title: "Referral Bonus", desc: "Refer a creator → extend your 0% fee by 1 month" },
];

const STEPS = [
  { num: "1", title: "Sign Up", desc: "One-click GitHub OAuth. Takes 10 seconds.", time: "10s" },
  { num: "2", title: "Upload Your Skill", desc: "Got a .cursorrules, AGENTS.md, or workflow? Upload it as-is.", time: "2 min" },
  { num: "3", title: "Set Your Price", desc: "Free or paid ($1-$50). You decide. We handle payments via Stripe.", time: "1 min" },
  { num: "4", title: "Submit for Review", desc: "Auto format check + human review within 24h.", time: "1 min" },
  { num: "5", title: "Start Earning 🎉", desc: "Your skill goes live. Share it, get downloads, earn money.", time: "Done!" },
];

const FAQ = [
  { q: "What counts as a Skill?", a: "Anything that makes AI tools better: Claude Code workflows, Cursor rules, system prompts, automation scripts, agent configurations. If it's in Markdown + config files, it's a Skill." },
  { q: "Do I need to be a developer?", a: "If you can write Markdown, you can create a Skill. If you're already using Claude Code or Cursor, you have the skills." },
  { q: "What happens after 6 months?", a: "Platform fee becomes 15% (includes Stripe payment processing). You set $10, you get $8.50." },
  { q: "Is there exclusivity?", a: "No. Your content stays yours. Publish it on GitHub, your blog, anywhere. No lock-in." },
  { q: "Can I publish free Skills?", a: "Absolutely. Free Skills build your audience. Many creators use Free + Pro tiers together." },
  { q: "What are the review criteria?", a: "It works, it has docs, it's not malicious. We don't gatekeep creativity — just quality baseline." },
];

export default function CreatorsPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 mb-6">
            🌟 Early Creator Program — Limited to 50 Spots
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Build Skills. Earn Money.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Shape the AI Ecosystem.
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Skill Market is the App Store for AI tool skills. You write Claude Code workflows,
            Cursor rules, and AI configs — now turn them into products that earn passive income.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-8 py-3.5 text-lg font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              🚀 Join as Early Creator
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-8 py-3.5 text-lg font-medium text-gray-300 hover:border-emerald-500/50 hover:text-white transition-all"
            >
              How It Works ↓
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 sm:p-10">
          <h2 className="text-2xl font-bold mb-4">You&apos;re already doing the hard part.</h2>
          <div className="space-y-3 text-gray-400">
            <p>✅ Writing .cursorrules to optimize your AI coding experience</p>
            <p>✅ Perfecting Claude Code system prompts and workflows</p>
            <p>✅ Building automation scripts for repetitive tasks</p>
            <p>✅ Sharing configs on GitHub for free</p>
          </div>
          <p className="text-xl font-semibold text-white mt-6">
            The only difference? <span className="text-emerald-400">You&apos;re not getting paid.</span>
          </p>
        </div>
      </section>

      {/* Early Creator Perks */}
      <section className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          🎁 Early Creator Perks
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((perk) => (
            <div key={perk.title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl mb-3">{perk.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-1">{perk.title}</h3>
              <p className="text-sm text-gray-400">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          From zero to published in 5 minutes
        </h2>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.num} className="flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500 bg-gray-800 rounded-full px-3 py-1">
                {step.time}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Early Creator vs. Regular</h2>
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-6 py-3 text-left text-gray-400 font-medium">Benefit</th>
                <th className="px-6 py-3 text-center text-gray-400 font-medium">Regular</th>
                <th className="px-6 py-3 text-center text-emerald-400 font-medium">🌟 Early Creator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ["Platform Fee", "15%", "0% for 6 months"],
                ["Review Time", "48h", "24h"],
                ["Homepage Placement", "Algorithm", "Featured section"],
                ["Profile Badge", "—", "🌟 Founding Creator"],
                ["Discord Role", "@creator", "@founding-creator"],
                ["Roadmap Voting", "—", "✅"],
              ].map(([benefit, regular, early]) => (
                <tr key={benefit} className="bg-gray-950/50">
                  <td className="px-6 py-3 text-gray-300">{benefit}</td>
                  <td className="px-6 py-3 text-center text-gray-500">{regular}</td>
                  <td className="px-6 py-3 text-center text-emerald-400 font-medium">{early}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <h3 className="font-semibold text-white mb-2">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-gray-950 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start?</h2>
          <p className="text-gray-400 mb-6">
            Join {50} early creators building the future of AI tool skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-8 py-3.5 text-lg font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              🚀 Join as Early Creator
            </Link>
            <Link
              href="https://discord.gg/skillmarket"
              className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-8 py-3.5 text-lg font-medium text-gray-300 hover:border-emerald-500/50 hover:text-white transition-all"
            >
              💬 Join Discord
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
