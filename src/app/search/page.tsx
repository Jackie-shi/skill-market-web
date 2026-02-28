"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { CATEGORIES } from "@/lib/categories";
import { SkillCategory } from "@/lib/types";
import SkillCard from "@/components/SkillCard";
import SkillCardSkeleton from "@/components/SkillCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

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

const SUGGESTIONS = ["git", "testing", "kubernetes", "react", "docker", "productivity", "deployment", "database"];

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
  const [filterOpen, setFilterOpen] = useState(false);
  const isInitial = useRef(true);

  const debouncedQuery = useDebounce(query, 300);

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

  // Initial fetch
  useEffect(() => {
    fetchSkills(initialQ, initialCat ?? "", initialSort);
    isInitial.current = false;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search on query change
  useEffect(() => {
    if (isInitial.current) return;
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category) params.set("category", category);
    if (sort && sort !== "relevance") params.set("sort", sort);
    router.replace(`/search?${params.toString()}`, { scroll: false });
    fetchSkills(debouncedQuery, category, sort);
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = (cat: string, s: string) => {
    setCategory(cat as SkillCategory | "");
    setSort(s);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (cat) params.set("category", cat);
    if (s && s !== "relevance") params.set("sort", s);
    router.replace(`/search?${params.toString()}`, { scroll: false });
    fetchSkills(debouncedQuery, cat, s);
  };

  const skeletonGrid = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkillCardSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">Browse Skills</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">Search skills</label>
          <input
            id="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, keyword, description..."
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="sm:hidden flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300"
          aria-expanded={filterOpen}
          aria-label="Toggle filters"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters {(category || sort !== "relevance") && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>

        {/* Desktop filters (always visible) + Mobile drawer */}
        <div className={`${filterOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row gap-3`}>
          <div>
            <label htmlFor="category-filter" className="sr-only">Category</label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => updateFilter(e.target.value, sort)}
              className="w-full sm:w-auto rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer sm:min-w-[160px]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label} ({categoryCounts[c.value] ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="sr-only">Sort by</label>
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) => updateFilter(category, e.target.value)}
              className="w-full sm:w-auto rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer sm:min-w-[140px]"
            >
              <option value="relevance">Relevance</option>
              <option value="downloads">Most Downloads</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {results.length} skill{results.length !== 1 ? "s" : ""} found
          {query && <> for &ldquo;<span className="text-gray-300">{query}</span>&rdquo;</>}
          {category && <> in <span className="text-gray-300 capitalize">{category}</span></>}
        </p>
      )}

      {/* Results */}
      {loading ? skeletonGrid : results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-xl font-semibold mb-2">No skills found</p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {query
              ? <>We couldn&apos;t find skills matching &ldquo;<span className="text-white font-medium">{query}</span>&rdquo;. Try a different search or browse by category.</>
              : "No skills match your current filters. Try adjusting or clearing them."}
          </p>

          {/* Quick suggestions */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">🏷️ Try a popular search</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setQuery(tag); }}
                    className="rounded-full border border-gray-700 px-4 py-1.5 text-sm text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Category quick picks */}
            {!category && (
              <div>
                <p className="text-sm text-gray-500 mb-3">📂 Or browse a category</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CATEGORIES.filter((c) => (categoryCounts[c.value] ?? 0) > 0).slice(0, 5).map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateFilter(cat.value, sort)}
                      className="rounded-full border border-gray-700 px-4 py-1.5 text-sm text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                    >
                      {cat.icon} {cat.label} ({categoryCounts[cat.value]})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category && (
              <button
                onClick={() => updateFilter("", sort)}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ✕ Clear category filter
              </button>
            )}

            <div className="pt-4 border-t border-gray-800 max-w-sm mx-auto">
              <p className="text-sm text-gray-400 mb-3">Can&apos;t find what you need?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/publish"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                  ✨ Create &amp; publish it
                </Link>
                <a
                  href="https://github.com/Jackie-shi/skill-market-web/issues/new?title=Skill+Request:&labels=skill-request"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all"
                >
                  💡 Request a skill
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="h-8 bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
