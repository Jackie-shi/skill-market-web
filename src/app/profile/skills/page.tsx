"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: string }> = {
  pending: { label: "Pending Review", class: "bg-yellow-900/50 text-yellow-400", icon: "⏳" },
  approved: { label: "Live", class: "bg-emerald-900/50 text-emerald-400", icon: "✅" },
  rejected: { label: "Rejected", class: "bg-red-900/50 text-red-400", icon: "❌" },
  delisted: { label: "Delisted", class: "bg-gray-800 text-gray-400", icon: "📦" },
};

export default function MySkillsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/profile/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setOverview(data.overview);
        setSkills(data.skills || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile/skills");
      return;
    }
    if (status === "authenticated") fetchData();
  }, [status, router]);

  const toggleStatus = async (skillName: string) => {
    setToggling(skillName);
    try {
      const res = await fetch(`/api/skills/${skillName}/toggle-status`, { method: "POST" });
      if (res.ok) fetchData();
    } catch { /* ignore */ }
    setToggling(null);
  };

  if (status === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
        <Link href="/publish" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 transition-colors">
          + Publish New Skill
        </Link>
      </div>

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Skills</p>
            <p className="text-2xl font-bold text-white">{overview.totalSkills}</p>
            <p className="text-xs text-gray-500">{overview.liveSkills} live</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Downloads</p>
            <p className="text-2xl font-bold text-emerald-400">{overview.totalDownloads.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-purple-400">${overview.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-white">{overview.totalPurchases}</p>
          </div>
        </div>
      )}

      {/* Skills List */}
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
            <Link href="/publish" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500 transition-colors">
              ✨ Publish Your First Skill
            </Link>
            <Link href="/search" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all">
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
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-300">Your Skills</h2>
          {skills.map((skill) => {
            const sc = STATUS_CONFIG[skill.status] || STATUS_CONFIG.pending;
            return (
              <div key={skill.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{skill.displayName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sc.class}`}>{sc.icon} {sc.label}</span>
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        <span className="text-emerald-400 font-medium">{skill.downloads}</span> downloads
                      </span>
                      {skill.pricingModel !== "free" && (
                        <span className="text-gray-400">
                          <span className="text-purple-400 font-medium">${skill.earnings.toFixed(2)}</span> earned
                        </span>
                      )}
                      {skill.reviewCount > 0 && (
                        <span className="text-gray-400">
                          <span className="text-yellow-400">{"★".repeat(Math.round(skill.averageRating))}</span>
                          <span className="text-gray-500 ml-1">({skill.reviewCount})</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {skill.pricingModel === "free" ? "Free" : `$${skill.price}`}
                      </span>
                    </div>
                    {/* Download trend bar (simple visual) */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (skill.downloads / Math.max(1, ...skills.map(s => s.downloads))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(skill.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {skill.status === "approved" && (
                      <Link href={`/skills/${skill.name}`} className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1">
                        View
                      </Link>
                    )}
                    {(skill.status === "approved" || skill.status === "pending" || skill.status === "delisted") && (
                      <Link href={`/profile/skills/${skill.name}/edit`}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                        Edit
                      </Link>
                    )}
                    {(skill.status === "approved" || skill.status === "delisted") && (
                      <button
                        onClick={() => toggleStatus(skill.name)}
                        disabled={toggling === skill.name}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          skill.status === "approved"
                            ? "bg-red-900/30 hover:bg-red-900/50 text-red-400"
                            : "bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400"
                        }`}
                      >
                        {toggling === skill.name ? "..." : skill.status === "approved" ? "Delist" : "Relist"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
