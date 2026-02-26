"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import ReactMarkdown from "react-markdown";

const PLATFORMS = [
  { value: "openclaw", label: "OpenClaw" },
  { value: "claude-code", label: "Claude Code" },
  { value: "cursor", label: "Cursor" },
  { value: "windsurf", label: "Windsurf" },
  { value: "generic", label: "Generic" },
];

const PRICING_MODELS = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "freemium", label: "Freemium" },
  { value: "donation", label: "Donation" },
];

export default function EditSkillPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [publishingVersion, setPublishingVersion] = useState(false);
  const [versionError, setVersionError] = useState("");
  const [versionSuccess, setVersionSuccess] = useState("");

  const [showMdPreview, setShowMdPreview] = useState(false);
  const [form, setForm] = useState({
    displayName: "", description: "", longDescription: "", version: "",
    category: "", pricingModel: "free", price: "", platforms: [] as string[],
    osTargets: [] as string[], keywords: "", license: "MIT", repository: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated" && slug) {
      fetch(`/api/skills/${slug}/edit`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) { setError(data.error); return; }
          const s = data.skill;
          setForm({
            displayName: s.displayName || "",
            description: s.description || "",
            longDescription: s.longDescription || "",
            version: s.version || "",
            category: s.category || "",
            pricingModel: s.pricingModel || "free",
            price: s.price ? String(s.price) : "",
            platforms: s.platforms ? JSON.parse(s.platforms) : [],
            osTargets: s.osTargets ? JSON.parse(s.osTargets) : [],
            keywords: s.keywords ? JSON.parse(s.keywords).join(", ") : "",
            license: s.license || "MIT",
            repository: s.repository || "",
          });
        })
        .catch(() => setError("Failed to load skill"))
        .finally(() => setLoading(false));
    }
  }, [status, slug, router]);

  const update = (field: string, value: string | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  };

  const togglePlatform = (val: string) => {
    const arr = form.platforms;
    update("platforms", arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const keywords = form.keywords ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [];
    try {
      const res = await fetch(`/api/skills/${slug}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: (form.pricingModel === "paid" || form.pricingModel === "freemium") ? parseFloat(form.price) : undefined,
          keywords: keywords.length ? keywords : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed"); return; }
      setSuccess(true);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishVersion = async () => {
    setVersionError("");
    setVersionSuccess("");
    if (!newVersion) { setVersionError("Version is required"); return; }
    setPublishingVersion(true);
    try {
      const res = await fetch(`/api/skills/${slug}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: newVersion, changelog: changelog || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setVersionError(data.error || "Failed to publish version"); return; }
      setVersionSuccess(`Version ${newVersion} published!`);
      update("version", newVersion);
      setNewVersion("");
      setChangelog("");
      setTimeout(() => setShowVersionModal(false), 1500);
    } catch {
      setVersionError("Network error");
    } finally {
      setPublishingVersion(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  const inputCls = "w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-300 text-sm">← Back</button>
        <h1 className="text-2xl font-bold">Edit Skill</h1>
        <span className="text-sm text-gray-500 font-mono">{slug}</span>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-400">✅ Changes saved! Your skill has been sent for re-review.</div>}

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
            <input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Version</label>
            <input value={form.version} onChange={(e) => update("version", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
          <input value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={200} className={inputCls} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-300">Full Description (Markdown)</label>
            <button type="button" onClick={() => setShowMdPreview(!showMdPreview)}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
              {showMdPreview ? "✏️ Edit" : "👁 Preview"}
            </button>
          </div>
          {showMdPreview ? (
            <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 min-h-[200px] prose prose-invert prose-sm max-w-none text-gray-300 overflow-y-auto max-h-96">
              {form.longDescription ? <ReactMarkdown>{form.longDescription}</ReactMarkdown> : <p className="text-gray-600 italic">No description yet</p>}
            </div>
          ) : (
            <textarea value={form.longDescription} onChange={(e) => update("longDescription", e.target.value)}
              rows={8} className={`${inputCls} resize-y`} />
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">License</label>
            <select value={form.license} onChange={(e) => update("license", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache 2.0</option>
              <option value="GPL-3.0">GPL 3.0</option>
              <option value="BSD-3-Clause">BSD 3-Clause</option>
              <option value="proprietary">Proprietary</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button key={p.value} type="button" onClick={() => togglePlatform(p.value)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  form.platforms.includes(p.value) ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                }`}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Pricing Model</label>
            <select value={form.pricingModel} onChange={(e) => update("pricingModel", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
              {PRICING_MODELS.map((pm) => <option key={pm.value} value={pm.value}>{pm.label}</option>)}
            </select>
          </div>
          {(form.pricingModel === "paid" || form.pricingModel === "freemium") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD)</label>
              <input value={form.price} onChange={(e) => update("price", e.target.value)} type="number" min="0.99" step="0.01" className={inputCls} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
          <input value={form.keywords} onChange={(e) => update("keywords", e.target.value)} placeholder="Comma-separated" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Repository URL</label>
          <input value={form.repository} onChange={(e) => update("repository", e.target.value)} type="url" className={inputCls} />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
          <button onClick={handleSave} disabled={saving}
            className="rounded-lg bg-emerald-600 px-8 py-3 font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={() => setShowVersionModal(true)}
            className="rounded-lg border border-emerald-600 px-6 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-600/10 transition-colors">
            🚀 Publish New Version
          </button>
          <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-300">Cancel</button>
        </div>

        {/* Version publish modal */}
        {showVersionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowVersionModal(false)}>
            <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold">Publish New Version</h2>
              <p className="text-sm text-gray-400">Current version: <span className="font-mono text-gray-300">v{form.version}</span></p>

              {versionError && <div className="rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-sm text-red-400">{versionError}</div>}
              {versionSuccess && <div className="rounded-lg border border-emerald-800 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-400">{versionSuccess}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Version (semver)</label>
                <input value={newVersion} onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="e.g. 1.1.0" className={inputCls} />
                <p className="text-xs text-gray-600 mt-1">Must be greater than {form.version}. Format: MAJOR.MINOR.PATCH</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Changelog</label>
                <textarea value={changelog} onChange={(e) => setChangelog(e.target.value)}
                  rows={4} placeholder="What changed in this version?" className={`${inputCls} resize-y`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handlePublishVersion} disabled={publishingVersion}
                  className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50">
                  {publishingVersion ? "Publishing..." : "Publish Version"}
                </button>
                <button onClick={() => setShowVersionModal(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
