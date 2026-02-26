"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Skill {
  id: string;
  displayName: string;
  name: string;
  description: string;
  downloads: number;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  price: number;
  pricingModel: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: string }> = {
  pending: { label: "Pending Review", class: "bg-yellow-900/50 text-yellow-400", icon: "⏳" },
  approved: { label: "Live", class: "bg-emerald-900/50 text-emerald-400", icon: "✅" },
  rejected: { label: "Rejected", class: "bg-red-900/50 text-red-400", icon: "❌" },
};

export default function MySkillsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile/skills");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile/skills")
        .then((r) => r.json())
        .then((data) => setSkills(data.skills || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Skills</h1>
        <Link href="/publish" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500">
          Publish New Skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <p className="text-gray-400 mb-4">You haven&apos;t published any skills yet.</p>
          <Link href="/publish" className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500">
            Publish Your First Skill
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => {
            const sc = STATUS_CONFIG[skill.status] || STATUS_CONFIG.pending;
            return (
              <div key={skill.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{skill.displayName}</h3>
                      {skill.status === "approved" && (
                        <Link href={`/skills/${skill.name}`} className="text-xs text-emerald-400 hover:text-emerald-300 shrink-0">
                          View →
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">{skill.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{skill.downloads} downloads</span>
                      <span>{skill.pricingModel === "free" ? "Free" : `$${skill.price}`}</span>
                      <span>Submitted {new Date(skill.createdAt).toLocaleDateString()}</span>
                    </div>
                    {skill.status === "rejected" && skill.reviewNote && (
                      <p className="text-xs text-red-400 mt-1">💬 {skill.reviewNote}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-3 ${sc.class}`}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
