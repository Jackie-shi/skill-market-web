"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
    createdAt: string;
  };
  stats: {
    publishedSkills: number;
    totalDownloads: number;
    totalPurchases: number;
    totalEarnings: number;
  };
  recentSkills: Array<{
    id: string;
    displayName: string;
    downloads: number;
    status: string;
    price: number;
    pricingModel: string;
  }>;
  recentPurchases: Array<{
    id: string;
    amount: number;
    createdAt: string;
    skill: { displayName: string };
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then(setProfile)
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

  if (!session || !profile) return null;

  const { user, stats, recentSkills, recentPurchases } = profile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        {user.image ? (
          <Image src={user.image} alt={user.name || ""} width={80} height={80} className="rounded-full" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-bold">
            {(user.name || "U")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
          {user.email && <p className="text-gray-400 text-sm">{user.email}</p>}
          {user.bio && <p className="text-gray-300 text-sm mt-2">{user.bio}</p>}
          <div className="flex items-center gap-4 mt-2">
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300">
                GitHub ↗
              </a>
            )}
            {user.websiteUrl && (
              <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300">
                Website ↗
              </a>
            )}
            <span className="text-xs text-gray-600">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Published Skills", value: stats.publishedSkills, href: "/profile/skills" },
          { label: "Total Downloads", value: stats.totalDownloads },
          { label: "Purchases", value: stats.totalPurchases, href: "/profile/purchases" },
          { label: "Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, href: "/profile/earnings" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            {s.href ? (
              <Link href={s.href} className="block hover:text-emerald-400 transition-colors">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </Link>
            ) : (
              <>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recent Skills */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Skills</h2>
          <Link href="/profile/skills" className="text-sm text-emerald-500 hover:text-emerald-400">View All →</Link>
        </div>
        {recentSkills.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
            <p className="text-gray-400 mb-3">You haven&apos;t published any skills yet.</p>
            <Link href="/publish" className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500">
              Publish Your First Skill
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                <div>
                  <p className="font-medium">{skill.displayName}</p>
                  <p className="text-xs text-gray-500">{skill.downloads} downloads · {skill.pricingModel === "free" ? "Free" : `$${skill.price}`}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  skill.status === "approved" ? "bg-emerald-900/50 text-emerald-400" :
                  skill.status === "pending" ? "bg-yellow-900/50 text-yellow-400" :
                  "bg-red-900/50 text-red-400"
                }`}>
                  {skill.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Purchases */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Purchases</h2>
          <Link href="/profile/purchases" className="text-sm text-emerald-500 hover:text-emerald-400">View All →</Link>
        </div>
        {recentPurchases.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
            <p className="text-gray-400">No purchases yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPurchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                <div>
                  <p className="font-medium">{p.skill.displayName}</p>
                  <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-medium">${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
