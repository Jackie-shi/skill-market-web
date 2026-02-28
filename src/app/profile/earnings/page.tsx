"use client";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EarningsData {
  totalEarnings: number;
  totalSales: number;
  commissionRate: number;
  sales: Array<{
    id: string;
    amount: number;
    platformFee: number | null;
    creatorPayout: number | null;
    createdAt: string;
    skill: { displayName: string };
    user: { name: string | null };
  }>;
}

interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
}

export default function EarningsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>}>
      <EarningsPage />
    </Suspense>
  );
}

function EarningsPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<EarningsData | null>(null);
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  const connectResult = searchParams.get("connect");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile/earnings");
      return;
    }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/profile/earnings").then((r) => r.json()),
        fetch("/api/connect/status").then((r) => r.json()),
      ])
        .then(([earningsData, connectData]) => {
          setData(earningsData);
          setConnect(connectData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  async function handleConnectOnboard() {
    setOnboarding(true);
    try {
      const res = await fetch("/api/connect/onboard", { method: "POST" });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert(error || "Failed to start onboarding");
      }
    } catch {
      alert("Network error");
    } finally {
      setOnboarding(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>

      {/* Connect status banner */}
      {connectResult === "complete" && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-900/30 p-4 text-sm text-emerald-300">
          ✅ Stripe Connect setup complete! Payouts will be sent to your connected account.
        </div>
      )}

      {connect && !connect.onboarded && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/20 p-4">
          <h3 className="font-semibold text-yellow-300 mb-2">💳 Set Up Payouts</h3>
          <p className="text-sm text-gray-400 mb-3">
            Connect your Stripe account to receive payouts. You keep 85% of each sale — we handle the rest.
          </p>
          <button
            onClick={handleConnectOnboard}
            disabled={onboarding}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {onboarding ? "Setting up..." : connect.connected ? "Complete Stripe Setup" : "Connect Stripe Account"}
          </button>
        </div>
      )}

      {connect?.onboarded && (
        <div className="rounded-lg border border-emerald-800/50 bg-emerald-900/10 p-3 text-xs text-emerald-400">
          ✓ Stripe connected — payouts go directly to your account
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-2xl font-bold text-emerald-400">${data.totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Earnings (after {data.commissionRate}% commission)</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-2xl font-bold">{data.totalSales}</p>
          <p className="text-xs text-gray-500 mt-1">Total Sales</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-2xl font-bold">
            ${data.totalSales > 0 ? (data.totalEarnings / data.totalSales).toFixed(2) : "0.00"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Avg. per Sale</p>
        </div>
      </div>

      {/* Sales history */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Sales History</h2>
        {data.sales.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/30 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Your first sale is coming</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Once users purchase your premium skills, sales will appear here. Focus on quality — great skills sell themselves.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/publish" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 transition-colors">
                ✨ Publish a Skill
              </a>
              <a href="/creators" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm text-gray-300 hover:border-gray-500 transition-all">
                📖 Creator Tips
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.sales.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
                <div>
                  <p className="font-medium">{s.skill.displayName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()} · Buyer: {s.user.name || "Anonymous"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-emerald-400">
                    +${(s.creatorPayout ?? s.amount * 0.85).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">${s.amount.toFixed(2)} gross</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
