"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface SkillReview {
  id: string;
  name: string;
  displayName: string;
  description: string;
  longDescription: string | null;
  version: string;
  category: string;
  pricingModel: string;
  price: number;
  platforms: string;
  osTargets: string | null;
  keywords: string | null;
  license: string | null;
  repository: string | null;
  status: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string | null; image: string | null };
}

export default function AdminReviewPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<SkillReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [acting, setActing] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/skills?status=${filter}`);
      if (res.status === 403) { router.push("/"); return; }
      const data = await res.json();
      setSkills(data.skills || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter, router]);

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/auth/signin"); return; }
    if (authStatus === "authenticated") fetchSkills();
  }, [authStatus, fetchSkills, router]);

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    try {
      await fetch(`/api/admin/skills/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: noteMap[id] || "" }),
      });
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
    setActing(null);
  };

  const parsePlatforms = (raw: string) => { try { return JSON.parse(raw) as string[]; } catch { return []; } };
  const parseKeywords = (raw: string | null) => { if (!raw) return []; try { return JSON.parse(raw) as string[]; } catch { return []; } };

  if (authStatus === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛡️ Skill Review Queue</h1>
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                filter === s ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <p className="text-gray-400">No {filter} skills to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{skill.displayName}</h3>
                  <p className="text-sm text-gray-500">{skill.name} v{skill.version} · by {skill.author.name || skill.author.email || "Unknown"}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-gray-800 px-2 py-1">{skill.category}</span>
                  <span className="rounded-full bg-gray-800 px-2 py-1">{skill.pricingModel === "free" ? "Free" : `$${skill.price}`}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300">{skill.description}</p>
              {skill.longDescription && (
                <details className="text-sm">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-400">Full description</summary>
                  <pre className="mt-2 text-gray-400 whitespace-pre-wrap text-xs bg-gray-950 rounded-lg p-3 max-h-48 overflow-y-auto">{skill.longDescription}</pre>
                </details>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-2 text-xs">
                {parsePlatforms(skill.platforms).map((p) => (
                  <span key={p} className="rounded-md bg-blue-900/30 text-blue-400 px-2 py-0.5">{p}</span>
                ))}
                {parseKeywords(skill.keywords).map((k) => (
                  <span key={k} className="rounded-md bg-gray-800 text-gray-400 px-2 py-0.5">#{k}</span>
                ))}
                {skill.license && <span className="rounded-md bg-gray-800 text-gray-400 px-2 py-0.5">📄 {skill.license}</span>}
                {skill.repository && (
                  <a href={skill.repository} target="_blank" rel="noopener noreferrer"
                    className="rounded-md bg-gray-800 text-emerald-400 px-2 py-0.5 hover:bg-gray-700">🔗 Repo</a>
                )}
              </div>

              <p className="text-xs text-gray-500">Submitted {new Date(skill.createdAt).toLocaleString()}</p>

              {/* Actions */}
              {filter === "pending" && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                  <input
                    placeholder="Review note (optional)"
                    value={noteMap[skill.id] || ""}
                    onChange={(e) => setNoteMap((m) => ({ ...m, [skill.id]: e.target.value }))}
                    className="flex-1 rounded-lg bg-gray-950 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleReview(skill.id, "approve")}
                    disabled={acting === skill.id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors">
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReview(skill.id, "reject")}
                    disabled={acting === skill.id}
                    className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition-colors">
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
