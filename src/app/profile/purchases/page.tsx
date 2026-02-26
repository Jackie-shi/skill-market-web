"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  skill: { displayName: string; name: string };
}

export default function PurchasesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile/purchases");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile/purchases")
        .then((r) => r.json())
        .then((data) => setPurchases(data.purchases || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Purchase History</h1>

      {purchases.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center">
          <p className="text-gray-400">No purchases yet. Browse the marketplace to find skills.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <div>
                <p className="font-medium">{p.skill.displayName}</p>
                <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${p.amount.toFixed(2)}</p>
                <p className={`text-xs ${p.status === "completed" ? "text-emerald-400" : "text-yellow-400"}`}>{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
