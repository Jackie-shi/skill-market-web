"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell, Legend,
  AreaChart, Area,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalSkills: number;
    pendingReviews: number;
    gmv: number;
    platformFees: number;
    creatorPayouts: number;
    totalPurchases: number;
  };
  registrationTrend: { date: string; count: number }[];
  topSkills: { displayName: string; downloads: number; category: string; pricingModel: string }[];
  funnel: { stage: string; value: number }[];
  creatorActivity: { name: string; totalSkills: number; approvedSkills: number; lastUpdate: string }[];
  revenueTrend: { date: string; gmv: number; fee: number; payout: number }[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];
const FUNNEL_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "#1a1a2e", borderRadius: 12, padding: "20px 24px",
      border: "1px solid #2a2a4a", minWidth: 160,
    }}>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.status === 403) { router.push("/"); return; }
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    } finally {
      setLoading(false);
    }
  }, [range, router]);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/auth/signin");
    if (authStatus === "authenticated") fetchData();
  }, [authStatus, fetchData, router]);

  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f23", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#888", fontSize: 18 }}>Loading analytics...</div>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f23", color: "#e0e0e0", padding: "32px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>📊 Analytics Dashboard</h1>
          <p style={{ color: "#888", margin: "4px 0 0" }}>ClawHub 平台数据概览</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "1px solid #333",
                background: range === d ? "#6366f1" : "#1a1a2e",
                color: range === d ? "#fff" : "#aaa", cursor: "pointer", fontSize: 13,
              }}
            >
              {d}天
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
        <StatCard label="总用户" value={summary.totalUsers} />
        <StatCard label="上架 Skills" value={summary.totalSkills} />
        <StatCard label="待审核" value={summary.pendingReviews} />
        <StatCard label="总交易额 (GMV)" value={`$${summary.gmv.toLocaleString()}`} />
        <StatCard label="平台抽成" value={`$${summary.platformFees.toLocaleString()}`} sub="15% commission" />
        <StatCard label="创作者分成" value={`$${summary.creatorPayouts.toLocaleString()}`} sub="85% to creators" />
        <StatCard label="成功交易" value={summary.totalPurchases} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Registration Trend */}
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, border: "1px solid #2a2a4a" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px", fontSize: 16 }}>📈 用户注册趋势</h3>
          {data.registrationTrend.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: 40 }}>暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="注册数" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Skills Download */}
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, border: "1px solid #2a2a4a" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px", fontSize: 16 }}>🏆 下载排行 Top 10</h3>
          {data.topSkills.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: 40 }}>暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topSkills} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis type="number" stroke="#666" fontSize={11} />
                <YAxis dataKey="displayName" type="category" stroke="#666" fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
                />
                <Bar dataKey="downloads" name="下载量" radius={[0, 4, 4, 0]}>
                  {data.topSkills.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conversion Funnel */}
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, border: "1px solid #2a2a4a" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px", fontSize: 16 }}>🔽 转化漏斗</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.funnel.map((item, i) => {
              const maxVal = data.funnel[0]?.value || 1;
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              const convRate = i > 0 && data.funnel[i - 1].value > 0
                ? ((item.value / data.funnel[i - 1].value) * 100).toFixed(1)
                : null;
              return (
                <div key={item.stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{item.stage}</span>
                    <span style={{ fontSize: 13, color: "#aaa" }}>
                      {item.value}{convRate && <span style={{ color: "#666", marginLeft: 8 }}>({convRate}%)</span>}
                    </span>
                  </div>
                  <div style={{ background: "#0f0f23", borderRadius: 6, height: 24, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.max(pct, 2)}%`, height: "100%",
                      background: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                      borderRadius: 6, transition: "width 0.5s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Trend */}
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, border: "1px solid #2a2a4a" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px", fontSize: 16 }}>💰 收入趋势</h3>
          {data.revenueTrend.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: 40 }}>暂无交易数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
                  formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}
                />
                <Legend />
                <Area type="monotone" dataKey="gmv" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} name="GMV" />
                <Area type="monotone" dataKey="fee" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="平台抽成" />
                <Area type="monotone" dataKey="payout" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="创作者分成" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Creator Activity Table */}
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, border: "1px solid #2a2a4a", gridColumn: "1 / -1" }}>
          <h3 style={{ color: "#fff", margin: "0 0 16px", fontSize: 16 }}>👩‍💻 创作者活跃度</h3>
          {data.creatorActivity.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: 40 }}>暂无创作者</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a4a" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontSize: 12, fontWeight: 500 }}>创作者</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", color: "#888", fontSize: 12, fontWeight: 500 }}>总上架数</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", color: "#888", fontSize: 12, fontWeight: 500 }}>已通过</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", color: "#888", fontSize: 12, fontWeight: 500 }}>通过率</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontSize: 12, fontWeight: 500 }}>最近更新</th>
                </tr>
              </thead>
              <tbody>
                {data.creatorActivity.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #1a1a2e" }}>
                    <td style={{ padding: "10px 12px", fontSize: 14 }}>{c.name}</td>
                    <td style={{ textAlign: "center", padding: "10px 12px", fontSize: 14 }}>{c.totalSkills}</td>
                    <td style={{ textAlign: "center", padding: "10px 12px", fontSize: 14 }}>{c.approvedSkills}</td>
                    <td style={{ textAlign: "center", padding: "10px 12px", fontSize: 14, color: c.totalSkills > 0 && c.approvedSkills / c.totalSkills >= 0.8 ? "#22c55e" : "#f59e0b" }}>
                      {c.totalSkills > 0 ? `${Math.round((c.approvedSkills / c.totalSkills) * 100)}%` : "—"}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 12px", fontSize: 13, color: "#888" }}>
                      {new Date(c.lastUpdate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
