"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";
import SkillCard from "@/components/SkillCard";
import SkillCardSkeleton from "@/components/SkillCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

interface APISkill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  longDescription?: string;
  version: string;
  category: string;
  price: number;
  currency: string;
  pricingModel: string;
  platforms: string;
  osTargets?: string;
  keywords?: string;
  license?: string;
  repository?: string;
  downloads: number;
  averageRating: number;
  reviewCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null; image: string | null };
}

function toSkill(s: APISkill) {
  return {
    name: s.name,
    version: s.version,
    displayName: s.displayName,
    description: s.description,
    longDescription: s.longDescription,
    author: { name: s.author?.name ?? "Unknown" },
    license: s.license,
    keywords: s.keywords ? JSON.parse(s.keywords) : [],
    category: s.category as any,
    compatibility: {
      platforms: s.platforms ? JSON.parse(s.platforms) : [],
      os: s.osTargets ? JSON.parse(s.osTargets) : undefined,
    },
    pricing: {
      model: s.pricingModel as any,
      price: s.price > 0 ? s.price : undefined,
      currency: s.currency as any,
    },
    downloads: s.downloads,
    rating: s.averageRating > 0 ? s.averageRating : undefined,
    ratingCount: s.reviewCount > 0 ? s.reviewCount : undefined,
    featured: !!s.featured,
    createdAt: s.createdAt?.slice(0, 10),
    updatedAt: s.updatedAt?.slice(0, 10),
  };
}

function CategorySkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-700 rounded" />
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-20 mb-1" />
            <div className="h-3 bg-gray-800 rounded w-12" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState<ReturnType<typeof toSkill>[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        if (data.skills) setSkills(data.skills.map(toSkill));
        if (data.categoryCounts) setCategoryCounts(data.categoryCounts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Featured: skills marked featured, fallback to top downloads
  const featured = skills.filter((s) => s.featured);
  const popular = featured.length > 0
    ? featured.slice(0, 6)
    : [...skills].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0)).slice(0, 6);

  const newest = [...skills].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedQ.trim()) router.push(`/search?q=${encodeURIComponent(debouncedQ.trim())}`);
  };

  // Live search: navigate on debounced value change
  useEffect(() => {
    // Only auto-navigate if user typed something (not on mount)
    if (debouncedQ.trim().length >= 2) {
      // Don't navigate, just let Enter/submit handle it — debounce is for search page
    }
  }, [debouncedQ]);

  const skeletonGrid = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkillCardSkeleton key={i} />
      ))}
    </div>
  );

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
          <form onSubmit={handleSearch} className="max-w-lg mx-auto" role="search">
            <div className="relative">
              <label htmlFor="hero-search" className="sr-only">Search for skills</label>
              <input
                id="hero-search"
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

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold mb-6">📂 Browse by Category</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {loading ? (
            <CategorySkeleton />
          ) : (
            CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] ?? 0;
              return (
                <Link
                  key={cat.value}
                  href={`/search?category=${cat.value}`}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                    count > 0
                      ? "border-gray-800 bg-gray-900/50 hover:border-emerald-500/50 hover:bg-gray-900"
                      : "border-gray-800/50 bg-gray-900/20 opacity-50 cursor-default"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{cat.label}</div>
                    <div className="text-xs text-gray-500">{count} skill{count !== 1 ? "s" : ""}</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Featured / Popular */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {featured.length > 0 ? "⭐ Featured Skills" : "🔥 Most Popular"}
          </h2>
          <Link href="/search?sort=downloads" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all →
          </Link>
        </div>
        {loading ? skeletonGrid : popular.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((s) => (
              <SkillCard key={s.name} skill={s} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🌱</p>
            <p>No skills published yet. Be the first creator!</p>
            <Link href="/publish" className="text-emerald-400 hover:text-emerald-300 mt-2 inline-block">Publish a Skill →</Link>
          </div>
        )}
      </section>

      {/* Newest */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🆕 Recently Added</h2>
          <Link href="/search?sort=newest" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View all →
          </Link>
        </div>
        {loading ? skeletonGrid : newest.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((s) => (
              <SkillCard key={s.name} skill={s} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🕐</p>
            <p>New skills coming soon!</p>
          </div>
        )}
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
