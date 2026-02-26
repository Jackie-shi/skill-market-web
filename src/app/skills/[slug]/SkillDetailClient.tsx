"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PlatformBadge from "@/components/PlatformBadge";
import PriceBadge from "@/components/PriceBadge";
import InstallInstructions from "@/components/InstallInstructions";
import ReviewSection from "@/components/ReviewSection";
import { Skill } from "@/lib/types";

const OS_LABELS: Record<string, string> = { darwin: "macOS", linux: "Linux", win32: "Windows" };

function dbToSkill(s: any): Skill & { authorImage?: string; authorBio?: string } {
  return {
    name: s.name,
    version: s.version,
    displayName: s.displayName,
    description: s.description,
    longDescription: s.longDescription,
    author: { name: s.author?.name ?? "Unknown", url: s.author?.websiteUrl },
    license: s.license,
    repository: s.repository,
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
    authorImage: s.author?.image,
    authorBio: s.author?.bio,
  };
}

export default function SkillDetailClient({ slug }: { slug: string }) {
  const [skill, setSkill] = useState<(Skill & { authorImage?: string; authorBio?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/skills/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setSkill(dbToSkill(data.skill)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-gray-400">Loading skill...</p>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Skill not found</h1>
        <p className="text-gray-400 mb-6">The skill &ldquo;{slug}&rdquo; doesn&apos;t exist or hasn&apos;t been approved yet.</p>
        <Link href="/search" className="text-emerald-400 hover:text-emerald-300">← Browse all skills</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-300">Home</Link>
        <span>/</span>
        <Link href={`/search?category=${skill.category}`} className="hover:text-gray-300 capitalize">{skill.category}</Link>
        <span>/</span>
        <span className="text-gray-300">{skill.displayName}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-bold">{skill.displayName}</h1>
              <PriceBadge pricing={skill.pricing} />
            </div>
            <p className="text-lg text-gray-400 mb-4">{skill.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                {skill.authorImage && (
                  <img src={skill.authorImage} alt="" className="w-5 h-5 rounded-full" />
                )}
                by <span className="text-gray-300">{skill.author.name}</span>
              </span>
              <span>v{skill.version}</span>
              {skill.license && <span>{skill.license}</span>}
              {skill.updatedAt && <span>Updated {skill.updatedAt}</span>}
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            {skill.rating != null && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">★ {skill.rating.toFixed(1)}</div>
                <div className="text-xs text-gray-500">{skill.ratingCount} ratings</div>
              </div>
            )}
            {skill.downloads != null && (
              <div className="text-center">
                <div className="text-2xl font-bold">{skill.downloads.toLocaleString()}</div>
                <div className="text-xs text-gray-500">downloads</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold">{skill.compatibility.platforms.length}</div>
              <div className="text-xs text-gray-500">platforms</div>
            </div>
          </div>

          {/* Reviews */}
          <ReviewSection skillSlug={slug} />

          {/* Long description */}
          {skill.longDescription && (
            <div className="prose prose-invert prose-sm max-w-none">
              <h2 className="text-xl font-bold mb-4">About</h2>
              {skill.longDescription.split("\n").map((line, i) => {
                if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-semibold mt-6 mb-2">{line.replace("## ", "")}</h3>;
                if (line.startsWith("- ")) return <li key={i} className="text-gray-300 ml-4">{line.replace("- ", "")}</li>;
                if (line.match(/^\d+\./)) return <li key={i} className="text-gray-300 ml-4 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-gray-300">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Install card */}
          <InstallInstructions skill={skill} />

          {/* Compatibility */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
            <h3 className="font-semibold">Compatibility</h3>
            <div>
              <div className="text-xs text-gray-500 mb-2">Platforms</div>
              <div className="flex flex-wrap gap-1.5">
                {skill.compatibility.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
              </div>
            </div>
            {skill.compatibility.os && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Operating Systems</div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.compatibility.os.map((os) => (
                    <span key={os} className="rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{OS_LABELS[os] ?? os}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keywords */}
          {skill.keywords && skill.keywords.length > 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
              <h3 className="font-semibold">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {skill.keywords.map((k) => (
                  <Link key={k} href={`/search?q=${k}`} className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 transition-colors">
                    {k}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(skill.repository || skill.homepage || skill.author.url) && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-2">
              <h3 className="font-semibold mb-2">Links</h3>
              {skill.repository && (
                <a href={skill.repository} target="_blank" rel="noopener" className="block text-sm text-emerald-400 hover:text-emerald-300 truncate">📦 Repository</a>
              )}
              {skill.homepage && (
                <a href={skill.homepage} target="_blank" rel="noopener" className="block text-sm text-emerald-400 hover:text-emerald-300 truncate">🌐 Homepage</a>
              )}
              {skill.author.url && (
                <a href={skill.author.url} target="_blank" rel="noopener" className="block text-sm text-emerald-400 hover:text-emerald-300 truncate">👤 Author Website</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
