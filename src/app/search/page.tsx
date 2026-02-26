"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { CATEGORIES } from "@/lib/categories";
import { SkillCategory } from "@/lib/types";
import SkillCard from "@/components/SkillCard";

function toSkill(s: any) {
  return {
    name: s.name,
    version: s.version,
    displayName: s.displayName,
    description: s.description,
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
    createdAt: s.createdAt?.slice(0, 10),
    updatedAt: s.updatedAt?.slice(0, 10),
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";
  const initialCat = searchParams.get("category") as SkillCategory | null;
  const initialSort = searchParams.get("sort") ?? "relevance";

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState<SkillCategory | "">(initialCat ?? "");
  const [sort, setSort] = useState(initialSort);
  const [results, setResults] = useState<ReturnType<typeof toSkill>[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback((q: string, cat: string, s: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    if (s && s !== "relevance") params.set("sort", s);

    setLoading(true);
    fetch(`/api/skills?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.skills) setResults(data.skills.map(toSkill));
        if (data.categoryCounts) setCategoryCounts(data.categoryCounts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSkills(initialQ, initialCat ?? "", initialSort);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateURL = (q: string, cat: string, s: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    if (s && s !== "relevance") params.set("sort", s);
    router.replace(`/search?${params.toString()}`, { scroll: false });
    fetchSkills(q, cat, s);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">Browse Skills</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); updateURL(e.target.value, category, sort); }}
            placeholder="Search by name, keyword, description..."
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <svg className="absolute left-3 top-3 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as SkillCategory | ""); updateURL(query, e.target.value, sort); }}
          className="rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label} ({categoryCounts[c.value] ?? 0})
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); updateURL(query, category, e.target.value); }}
          className="rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="relevance">Relevance</option>
          <option value="downloads">Most Downloads</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
          <option value="updated">Recently Updated</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {loading ? "Searching..." : (
          <>
            {results.length} skill{results.length !== 1 ? "s" : ""} found
            {query && <> for &ldquo;<span className="text-gray-300">{query}</span>&rdquo;</>}
            {category && <> in <span className="text-gray-300 capitalize">{category}</span></>}
          </>
        )}
      </p>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-xl font-semibold mb-2">No skills found</p>
          <p className="text-gray-400">Try adjusting your search or filters.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><p className="text-gray-400">Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
