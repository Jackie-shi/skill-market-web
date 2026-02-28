"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";

interface SkillStat {
  id: string;
  name: string;
  displayName: string;
  status: string;
  downloads: number;
  earnings: number;
  pricingModel: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Overview {
  totalSkills: number;
  liveSkills: number;
  totalDownloads: number;
  totalEarnings: number;
  totalPurchases: number;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  pending: { label: "Pending Review", cls: "bg-yellow-900/50 text-yellow-400", icon: "⏳" },
  approved: { label: "Live", cls: "bg-emerald-900/50 text-emerald-400", icon: "✅" },
  rejected: { label: "Rejected", cls: "bg-red-900/50 text-red-400", icon: "❌" },
  delisted: { label: "Delisted", cls: "bg-gray-800 text-gray-400", icon: "📦" },
};

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function RevenueBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"downloads" | "earnings" | "createdAt">("downloads");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile/dashboard")
        .then((r) => r.json())
        .then((data) => {
          setOverview(data.overview);
          setSkills(data.skills || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const maxDownloads = Math.max(1, ...skills.map((s) => s.downloads));
  const maxEarnings = Math.max(1, ...skills.map((s) => s.earnings));

  const sorted = [...skills].sort((a, b) => {
    if (sortBy === "downloads") return b.downloads - a.downloads;
    if (sortBy === "earnings") return b.earnings - a.earnings;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your skills performance and earnings</p>
        </div>
        <Link
          href="/publish"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 transition-colors text-center"
        >
          + Publish New Skill
        </Link>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <Tooltip content="Skills submitted (pending + live + delisted)" position="bottom">
              <p className="text-xs text-gray-500 mb-1 cursor-help">Total Skills ℹ️</p>
            </Tooltip>
            <p className="text-2xl font-bold text-white">{overview.totalSkills}</p>
            <p className="text-xs text-gray-500 mt-1">{overview.liveSkills} live</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <Tooltip content="Free installs + paid purchases combined" position="bottom">
              <p className="text-xs text-gray-500 mb-1 cursor-help">Total Downloads ℹ️</p>
            </Tooltip>
            <p className="text-2xl font-bold text-emerald-400">{overview.totalDownloads.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <Tooltip content="Your earnings after 15% platform fee" position="bottom">
              <p className="text-xs text-gray-500 mb-1 cursor-help">Total Revenue ℹ️</p>
            </Tooltip>
            <p className="text-2xl font-bold text-purple-400">${overview.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <Tooltip content="Number of paid purchases across all your skills" position="bottom">
              <p className="text-xs text-gray-500 mb-1 cursor-help">Total Sales ℹ️</p>
            </Tooltip>
            <p className="text-2xl font-bold text-white">{overview.totalPurchases}</p>
          </div>
        </div>
      )}

      {/* Skills Table */}
      {skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/30 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Start your creator journey</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Publish your first AI skill and start building your creator profile. It only takes 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/publish"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500 transition-colors"
            >
              ✨ Publish Your First Skill
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all"
            >
              Browse for inspiration →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
            <div className="text-center">
              <p className="text-emerald-400 font-bold text-lg">5 min</p>
              <p className="text-gray-500">to publish</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-bold text-lg">0%</p>
              <p className="text-gray-500">fee for 6 months</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-bold text-lg">Free</p>
              <p className="text-gray-500">to list</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-300">My Skills</h2>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-600 mr-1">Sort:</span>
              {(["downloads", "earnings", "createdAt"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2 py-1 rounded transition-colors ${
                    sortBy === s ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-400"
                  }`}
                >
                  {s === "createdAt" ? "newest" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive table/cards */}
          <div className="space-y-3">
            {sorted.map((skill) => {
              const sc = STATUS_CONFIG[skill.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={skill.id}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{skill.displayName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sc.cls}`}>
                          {sc.icon} {sc.label}
                        </span>
                        <span className="text-xs text-gray-600 font-mono">{skill.name}</span>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Downloads</p>
                          <p className="text-emerald-400 font-semibold">{skill.downloads.toLocaleString()}</p>
                          <MiniBar value={skill.downloads} max={maxDownloads} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="text-purple-400 font-semibold">
                            {skill.pricingModel === "free" ? "Free" : `$${skill.earnings.toFixed(2)}`}
                          </p>
                          {skill.pricingModel !== "free" && (
                            <RevenueBar value={skill.earnings} max={maxEarnings} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rating</p>
                          <p className="text-white font-semibold">
                            {skill.reviewCount > 0 ? (
                              <>
                                <span className="text-yellow-400">{"★".repeat(Math.round(skill.averageRating))}</span>
                                <span className="text-gray-500 font-normal text-xs ml-1">({skill.reviewCount})</span>
                              </>
                            ) : (
                              <span className="text-gray-600">No reviews</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-white font-semibold">
                            {skill.pricingModel === "free" ? "Free" : `$${skill.price}`}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600">
                        Published {new Date(skill.createdAt).toLocaleDateString()} · Updated{" "}
                        {new Date(skill.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      {skill.status === "approved" && (
                        <Link
                          href={`/skills/${skill.name}`}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors w-full text-center"
                        >
                          View
                        </Link>
                      )}
                      {(skill.status === "approved" || skill.status === "pending" || skill.status === "delisted") && (
                        <Link
                          href={`/profile/skills/${skill.name}/edit`}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors w-full text-center"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
