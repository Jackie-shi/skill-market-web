"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PlatformBadge from "@/components/PlatformBadge";
import PriceBadge from "@/components/PriceBadge";
import InstallInstructions from "@/components/InstallInstructions";
import ReviewSection from "@/components/ReviewSection";
import CopyButton from "@/components/CopyButton";
import { Skill } from "@/lib/types";

const OS_LABELS: Record<string, string> = { darwin: "macOS", linux: "Linux", win32: "Windows" };

interface RelatedSkill {
  name: string;
  displayName: string;
  description: string;
  category: string;
  pricingModel: string;
  price: number;
  currency: string;
  downloads: number;
  averageRating: number;
  reviewCount: number;
  platforms: string;
}

function dbToSkill(s: any): Skill & { authorImage?: string; authorBio?: string; authorId?: string; authorGithubUrl?: string } {
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
    authorId: s.author?.id,
    authorGithubUrl: s.author?.githubUrl,
  };
}

export default function SkillDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [skill, setSkill] = useState<(Skill & { authorImage?: string; authorBio?: string; authorId?: string; authorGithubUrl?: string }) | null>(null);
  const [relatedSkills, setRelatedSkills] = useState<RelatedSkill[]>([]);
  const [authorSkillCount, setAuthorSkillCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/skills/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setSkill(dbToSkill(data.skill));
        setRelatedSkills(data.relatedSkills ?? []);
        setAuthorSkillCount(data.authorSkillCount ?? 0);
      })
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

  const installCmd = skill.compatibility.platforms.includes("openclaw")
    ? `clawhub install ${skill.name}`
    : `npx clawhub install ${skill.name}`;

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

            {/* Quick install copy bar */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-950 border border-gray-800 p-2 mb-4">
              <code className="flex-1 text-sm text-emerald-400 font-mono px-2 truncate">{installCmd}</code>
              <CopyButton text={installCmd} label="Copy" className="shrink-0 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors" />
            </div>

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

          {/* Long description — Markdown rendered */}
          {skill.longDescription && (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-gray-100 prose-a:text-emerald-400 prose-code:text-emerald-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {skill.longDescription}
              </ReactMarkdown>
            </div>
          )}

          {/* Related Skills */}
          {relatedSkills.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Related Skills</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedSkills.map((rs) => {
                  const platforms = rs.platforms ? JSON.parse(rs.platforms) : [];
                  return (
                    <Link
                      key={rs.name}
                      href={`/skills/${rs.name}`}
                      className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 hover:border-gray-700 hover:bg-gray-900/80 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors">{rs.displayName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rs.pricingModel === "free" ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"
                        }`}>
                          {rs.pricingModel === "free" ? "Free" : `$${rs.price}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{rs.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {rs.averageRating > 0 && <span className="text-yellow-400">★ {rs.averageRating.toFixed(1)}</span>}
                        <span>{rs.downloads.toLocaleString()} downloads</span>
                        <div className="flex gap-1">
                          {platforms.slice(0, 3).map((p: string) => (
                            <PlatformBadge key={p} platform={p} />
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Install card */}
          <InstallInstructions skill={skill} />

          {/* Author card */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
            <h3 className="font-semibold">Author</h3>
            <div className="flex items-center gap-3">
              {skill.authorImage ? (
                <img src={skill.authorImage} alt={skill.author.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-lg font-bold">
                  {(skill.author.name ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div>
                {skill.authorId ? (
                  <Link href={`/profile/${skill.authorId}`} className="font-medium text-gray-100 hover:text-emerald-400 transition-colors">
                    {skill.author.name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-100">{skill.author.name}</span>
                )}
                <div className="text-xs text-gray-500">{authorSkillCount} published skill{authorSkillCount !== 1 ? "s" : ""}</div>
              </div>
            </div>
            {skill.authorBio && (
              <p className="text-sm text-gray-400">{skill.authorBio}</p>
            )}
            <div className="flex gap-2">
              {skill.authorId && (
                <Link href={`/profile/${skill.authorId}`} className="text-xs text-emerald-400 hover:text-emerald-300">View profile →</Link>
              )}
              {skill.authorGithubUrl && (
                <a href={skill.authorGithubUrl} target="_blank" rel="noopener" className="text-xs text-gray-400 hover:text-gray-300">GitHub</a>
              )}
            </div>
          </div>

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
