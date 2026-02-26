"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SKILLS as MOCK_SKILLS, CATEGORIES } from "@/lib/mock-data";
import SkillCard from "@/components/SkillCard";
import { Skill } from "@/lib/types";

export default function Home() {
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        if (data.skills && data.skills.length > 0) setSkills(data.skills);
      })
      .catch(() => {}); // fallback to mock data
  }, []);

  const featured = skills.filter((s) => s.featured);
  const popular = [...skills].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0)).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            AI Skills,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Discover, share &amp; trade skills for Claude Code, OpenClaw, Cursor and beyond.
            Extend your AI tools in seconds.
          </p>
          <form onSubmit={handleSearch} className="max-w-lg mx-auto">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for skills (e.g. testing, kubernetes, git...)"
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-5 py-3.5 pl-12 text-base text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <svg className="absolute left-4 top-4 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-gray-500">Popular:</span>
            {["git", "testing", "kubernetes", "react"].map((tag) => (
              <Link key={tag} href={`/search?q=${tag}`} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">⭐ Featured Skills</h2>
          <Link href="/search" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold mb-6">📂 Browse by Category</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.filter((c) => c.count > 0).map((cat) => (
            <Link
              key={cat.value}
              href={`/search?category=${cat.value}`}
              className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4 hover:border-emerald-500/50 hover:bg-gray-900 transition-all"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <div className="text-sm font-medium text-white">{cat.label}</div>
                <div className="text-xs text-gray-500">{cat.count} skills</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold mb-6">🔥 Most Popular</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      </section>

      {/* Become a Creator CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-gray-950 p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 mb-4">
              🌟 Early Creator Program — Only {50} spots
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Build Skills. Earn Money.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Shape the AI Ecosystem.
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              You already write Claude Code workflows, Cursor rules, and AI configs.
              Now turn them into products — and earn passive income.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-8 max-w-3xl mx-auto">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium text-white">0% Fee for 6 Months</div>
              <div className="text-xs text-gray-500 mt-1">Keep 100% of your earnings</div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <div className="text-2xl mb-2">📌</div>
              <div className="text-sm font-medium text-white">Homepage Featured</div>
              <div className="text-xs text-gray-500 mt-1">Priority placement & badge</div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium text-white">5 Min to Publish</div>
              <div className="text-xs text-gray-500 mt-1">Markdown format, you already know it</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/creators" className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 transition-colors">
              🚀 Become a Creator →
            </Link>
            <Link href="/publish" className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-6 py-3 font-medium text-gray-300 hover:border-emerald-500/50 hover:text-white transition-all">
              Publish Your Skill
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
