"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

const PLATFORMS = [
  { value: "openclaw", label: "OpenClaw" },
  { value: "claude-code", label: "Claude Code" },
  { value: "cursor", label: "Cursor" },
  { value: "windsurf", label: "Windsurf" },
  { value: "generic", label: "Generic" },
];

const OS_OPTIONS = [
  { value: "darwin", label: "macOS" },
  { value: "linux", label: "Linux" },
  { value: "win32", label: "Windows" },
];

const PRICING_MODELS = [
  { value: "free", label: "Free", desc: "Open to everyone" },
  { value: "paid", label: "Paid", desc: "One-time purchase (15% commission)" },
  { value: "freemium", label: "Freemium", desc: "Free tier + paid upgrade" },
  { value: "donation", label: "Donation", desc: "Pay what you want" },
];

export default function PublishPage() {
  const { status } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pricingModel, setPricingModel] = useState("free");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [osTargets, setOsTargets] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (platforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    setSubmitting(true);
    const form = formRef.current!;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value || "";

    const keywordsRaw = get("keywords");
    const keywords = keywordsRaw ? keywordsRaw.split(",").map((k: string) => k.trim()).filter(Boolean) : [];

    const body = {
      name: get("name"),
      displayName: get("displayName"),
      version: get("version"),
      description: get("description"),
      longDescription: get("longDescription") || undefined,
      category: get("category"),
      pricingModel,
      price: pricingModel === "paid" || pricingModel === "freemium" ? parseFloat(get("price")) : undefined,
      platforms,
      osTargets: osTargets.length ? osTargets : undefined,
      keywords: keywords.length ? keywords : undefined,
      license: get("license") || "MIT",
      repository: get("repository") || undefined,
    };

    try {
      const res = await fetch("/api/skills/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-3xl font-bold mb-3">Skill Submitted!</h1>
        <p className="text-gray-400 mb-6">
          Your skill is now in the review queue. We&apos;ll notify you once it&apos;s approved and listed.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/profile/skills")} className="rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500 transition-colors">
            View My Skills
          </button>
          <button onClick={() => { setSubmitted(false); formRef.current?.reset(); setPlatforms([]); setOsTargets([]); setPricingModel("free"); }}
            className="text-emerald-400 hover:text-emerald-300 transition-colors px-6 py-3">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Publish a Skill</h1>
      <p className="text-gray-400 mb-8">Share your AI skill with the community. Free to publish — earn from paid skills.</p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">📝 Basic Information</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Skill Name *</label>
              <input name="name" required placeholder="my-awesome-skill" pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$" minLength={3} maxLength={50}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              <p className="text-xs text-gray-500 mt-1">Lowercase, hyphens only. 3-50 chars.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Display Name *</label>
              <input name="displayName" required placeholder="My Awesome Skill" maxLength={100}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Version *</label>
            <input name="version" required defaultValue="1.0.0" pattern="^\d+\.\d+\.\d+.*$"
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Short Description *</label>
            <input name="description" required placeholder="What does this skill do? (max 200 chars)" maxLength={200}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Description</label>
            <textarea name="longDescription" rows={6} placeholder="Detailed description with features, usage examples, etc. Markdown supported." maxLength={5000}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
            <select name="category" required defaultValue=""
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer">
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
            <input name="keywords" placeholder="Comma-separated: git, automation, testing" maxLength={200}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <p className="text-xs text-gray-500 mt-1">Up to 10 keywords, helps with search discovery.</p>
          </div>
        </fieldset>

        {/* Compatibility */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">🔌 Compatibility</legend>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platforms * (select at least one)</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.value} type="button"
                  onClick={() => setPlatforms(toggleArr(platforms, p.value))}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    platforms.includes(p.value)
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Operating Systems</label>
            <div className="flex flex-wrap gap-2">
              {OS_OPTIONS.map((o) => (
                <button key={o.value} type="button"
                  onClick={() => setOsTargets(toggleArr(osTargets, o.value))}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    osTargets.includes(o.value)
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty if your skill works on all platforms.</p>
          </div>
        </fieldset>

        {/* Pricing */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">💰 Pricing</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            {PRICING_MODELS.map((pm) => (
              <button key={pm.value} type="button"
                onClick={() => setPricingModel(pm.value)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  pricingModel === pm.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-700 bg-gray-900 hover:border-gray-600"
                }`}>
                <div className="font-medium text-white text-sm">{pm.label}</div>
                <div className="text-xs text-gray-500">{pm.desc}</div>
              </button>
            ))}
          </div>
          {(pricingModel === "paid" || pricingModel === "freemium") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD) *</label>
              <input name="price" type="number" min="0.99" step="0.01" required placeholder="4.99"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px]" />
            </div>
          )}
        </fieldset>

        {/* License & Repo */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">📄 License & Source</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">License</label>
              <select name="license" defaultValue="MIT"
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer">
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL 3.0</option>
                <option value="BSD-3-Clause">BSD 3-Clause</option>
                <option value="proprietary">Proprietary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Repository URL</label>
              <input name="repository" type="url" placeholder="https://github.com/..."
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Upload Skill Package</label>
            <div className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 p-8 text-center hover:border-gray-600 transition-colors cursor-pointer">
              <p className="text-gray-400 text-sm">Drag &amp; drop your skill folder (zip) or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Must contain skill.json + SKILL.md at minimum</p>
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
          <button type="submit" disabled={submitting}
            className="rounded-lg bg-emerald-600 px-8 py-3 font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
          <p className="text-xs text-gray-500">Your skill will be reviewed before going live. Usually within 24 hours.</p>
        </div>
      </form>
    </div>
  );
}
