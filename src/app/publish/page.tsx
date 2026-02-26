"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import ReactMarkdown from "react-markdown";

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

const STEPS = [
  { id: 1, title: "Basic Info", icon: "📝" },
  { id: 2, title: "Compatibility", icon: "🔌" },
  { id: 3, title: "Pricing & License", icon: "💰" },
  { id: 4, title: "Review & Submit", icon: "🚀" },
];

type FormData = {
  name: string;
  displayName: string;
  version: string;
  description: string;
  longDescription: string;
  category: string;
  keywords: string;
  platforms: string[];
  osTargets: string[];
  pricingModel: string;
  price: string;
  license: string;
  repository: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

function validateStep(step: number, data: FormData): Errors {
  const errors: Errors = {};
  if (step === 1) {
    if (!data.name) errors.name = "Required";
    else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(data.name) || data.name.length < 3)
      errors.name = "Lowercase, hyphens only, 3-50 chars (e.g. my-skill)";
    if (!data.displayName) errors.displayName = "Required";
    if (!data.version) errors.version = "Required";
    else if (!/^\d+\.\d+\.\d+/.test(data.version)) errors.version = "Must be semver (e.g. 1.0.0)";
    if (!data.description) errors.description = "Required";
    else if (data.description.length > 200) errors.description = "Max 200 characters";
    if (!data.category) errors.category = "Select a category";
  }
  if (step === 2) {
    if (data.platforms.length === 0) errors.platforms = "Select at least one platform";
  }
  if (step === 3) {
    if ((data.pricingModel === "paid" || data.pricingModel === "freemium") && (!data.price || parseFloat(data.price) < 0.99))
      errors.price = "Price must be at least $0.99";
  }
  return errors;
}

function SkillPreviewCard({ data }: { data: FormData }) {
  const cat = CATEGORIES.find((c) => c.value === data.category);
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/80 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg text-white">{data.displayName || "Skill Name"}</h3>
          <p className="text-xs text-gray-500 font-mono">{data.name || "skill-slug"}</p>
        </div>
        {data.pricingModel === "free" ? (
          <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded-full">Free</span>
        ) : (
          <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded-full">
            ${data.price || "0.00"}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400">{data.description || "Short description goes here..."}</p>
      <div className="flex flex-wrap gap-1.5">
        {cat && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{cat.icon} {cat.label}</span>}
        {data.platforms.map((p) => (
          <span key={p} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{p}</span>
        ))}
      </div>
      {data.longDescription && (
        <div className="pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 max-h-40 overflow-y-auto">
            <ReactMarkdown>{data.longDescription.slice(0, 500)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublishPage() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<{ name: string; displayName: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "", displayName: "", version: "1.0.0", description: "", longDescription: "",
    category: "", keywords: "", platforms: [], osTargets: [], pricingModel: "free",
    price: "", license: "MIT", repository: "",
  });

  // Auto-generate slug from display name
  useEffect(() => {
    if (form.displayName && !form.name) {
      const slug = form.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (slug.length >= 3) setForm((f) => ({ ...f, name: slug }));
    }
  }, [form.displayName, form.name]);

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleArr = (field: "platforms" | "osTargets", val: string) => {
    const arr = form[field];
    update(field, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const goNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    // Final validation across all steps
    for (let s = 1; s <= 3; s++) {
      const errs = validateStep(s, form);
      if (Object.keys(errs).length > 0) {
        setStep(s);
        setErrors(errs);
        return;
      }
    }

    setError("");
    setSubmitting(true);

    const keywords = form.keywords ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [];
    const body = {
      name: form.name,
      displayName: form.displayName,
      version: form.version,
      description: form.description,
      longDescription: form.longDescription || undefined,
      category: form.category,
      pricingModel: form.pricingModel,
      price: (form.pricingModel === "paid" || form.pricingModel === "freemium") ? parseFloat(form.price) : undefined,
      platforms: form.platforms,
      osTargets: form.osTargets.length ? form.osTargets : undefined,
      keywords: keywords.length ? keywords : undefined,
      license: form.license || "MIT",
      repository: form.repository || undefined,
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
      setSubmitted({ name: form.name, displayName: form.displayName });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  // Success screen with share/badge
  if (submitted) {
    const skillUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/skills/${submitted.name}`;
    const badgeMarkdown = `[![Skill Market](${typeof window !== "undefined" ? window.location.origin : ""}/api/badge/${submitted.name})](${skillUrl})`;
    const badgeHtml = `<a href="${skillUrl}"><img src="${typeof window !== "undefined" ? window.location.origin : ""}/api/badge/${submitted.name}" alt="${submitted.displayName} on Skill Market" /></a>`;

    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-3xl font-bold mb-3">Skill Submitted!</h1>
        <p className="text-gray-400 mb-8">
          Your skill is in the review queue. We&apos;ll notify you once it&apos;s approved and listed.
        </p>

        {/* Share Section */}
        <div className="text-left space-y-6 mb-8">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-gray-300">📎 Share Link (available after approval)</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-800 px-3 py-2 rounded text-emerald-400 overflow-x-auto">{skillUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(skillUrl)}
                className="shrink-0 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-gray-300 transition-colors">
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-gray-300">🏷️ Embed Badge (Markdown)</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-800 px-3 py-2 rounded text-gray-400 overflow-x-auto">{badgeMarkdown}</code>
              <button onClick={() => navigator.clipboard.writeText(badgeMarkdown)}
                className="shrink-0 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-gray-300 transition-colors">
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-gray-300">🏷️ Embed Badge (HTML)</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-800 px-3 py-2 rounded text-gray-400 overflow-x-auto">{badgeHtml}</code>
              <button onClick={() => navigator.clipboard.writeText(badgeHtml)}
                className="shrink-0 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-gray-300 transition-colors">
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/profile/skills")} className="rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500 transition-colors">
            View My Skills
          </button>
          <button onClick={() => { setSubmitted(null); setStep(1); setForm({ name: "", displayName: "", version: "1.0.0", description: "", longDescription: "", category: "", keywords: "", platforms: [], osTargets: [], pricingModel: "free", price: "", license: "MIT", repository: "" }); }}
            className="text-emerald-400 hover:text-emerald-300 transition-colors px-6 py-3">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const inputCls = (field: keyof FormData) =>
    `w-full rounded-lg bg-gray-900 border px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
      errors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
    }`;

  const fieldError = (field: keyof FormData) =>
    errors[field] ? <p className="text-xs text-red-400 mt-1">{errors[field]}</p> : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => { if (s.id < step) setStep(s.id); }}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  s.id === step ? "text-emerald-400" : s.id < step ? "text-gray-400 hover:text-gray-300 cursor-pointer" : "text-gray-600"
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  s.id === step ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" :
                  s.id < step ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-700 text-gray-600"
                }`}>
                  {s.id < step ? "✓" : s.id}
                </span>
                <span className="hidden sm:inline">{s.icon} {s.title}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 transition-colors ${s.id < step ? "bg-emerald-600" : "bg-gray-800"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main form */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-1">Publish a Skill</h1>
          <p className="text-gray-400 text-sm mb-6">Step {step} of 4 — {STEPS[step - 1].title}</p>

          {error && (
            <div className="mb-6 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name *</label>
                <input value={form.displayName} onChange={(e) => update("displayName", e.target.value)}
                  placeholder="My Awesome Skill" maxLength={100} className={inputCls("displayName")} />
                {fieldError("displayName")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Skill Slug *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)}
                  placeholder="my-awesome-skill" maxLength={50} className={inputCls("name")} />
                <p className="text-xs text-gray-500 mt-1">Lowercase, hyphens only. Auto-generated from display name.</p>
                {fieldError("name")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Version *</label>
                <input value={form.version} onChange={(e) => update("version", e.target.value)}
                  className={`${inputCls("version")} max-w-[200px]`} />
                {fieldError("version")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Short Description * <span className="text-gray-500 font-normal">({form.description.length}/200)</span>
                </label>
                <input value={form.description} onChange={(e) => update("description", e.target.value)}
                  placeholder="What does this skill do?" maxLength={200} className={inputCls("description")} />
                {fieldError("description")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Description (Markdown)</label>
                <textarea value={form.longDescription} onChange={(e) => update("longDescription", e.target.value)}
                  rows={6} placeholder="Detailed description with features, usage examples... Markdown supported."
                  maxLength={5000} className={`${inputCls("longDescription")} resize-y`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => update("category", e.target.value)}
                  className={`${inputCls("category")} appearance-none cursor-pointer`}>
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
                {fieldError("category")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
                <input value={form.keywords} onChange={(e) => update("keywords", e.target.value)}
                  placeholder="Comma-separated: git, automation, testing" maxLength={200} className={inputCls("keywords")} />
              </div>
            </div>
          )}

          {/* Step 2: Compatibility */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platforms * (select at least one)</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button key={p.value} type="button" onClick={() => toggleArr("platforms", p.value)}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        form.platforms.includes(p.value) ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                      }`}>{p.label}</button>
                  ))}
                </div>
                {errors.platforms && <p className="text-xs text-red-400 mt-1">{errors.platforms}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Operating Systems</label>
                <div className="flex flex-wrap gap-2">
                  {OS_OPTIONS.map((o) => (
                    <button key={o.value} type="button" onClick={() => toggleArr("osTargets", o.value)}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        form.osTargets.includes(o.value) ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                      }`}>{o.label}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for cross-platform skills.</p>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & License */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Model</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRICING_MODELS.map((pm) => (
                    <button key={pm.value} type="button" onClick={() => update("pricingModel", pm.value)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        form.pricingModel === pm.value ? "border-emerald-500 bg-emerald-500/10" : "border-gray-700 bg-gray-900 hover:border-gray-600"
                      }`}>
                      <div className="font-medium text-white text-sm">{pm.label}</div>
                      <div className="text-xs text-gray-500">{pm.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {(form.pricingModel === "paid" || form.pricingModel === "freemium") && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD) *</label>
                  <input value={form.price} onChange={(e) => update("price", e.target.value)}
                    type="number" min="0.99" step="0.01" placeholder="4.99"
                    className={`${inputCls("price")} max-w-[200px]`} />
                  {fieldError("price")}
                  {form.price && parseFloat(form.price) >= 0.99 && (
                    <p className="text-xs text-gray-500 mt-1">
                      You earn <span className="text-emerald-400">${(parseFloat(form.price) * 0.85).toFixed(2)}</span> per sale (85%)
                    </p>
                  )}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">License</label>
                  <select value={form.license} onChange={(e) => update("license", e.target.value)}
                    className={`${inputCls("license")} appearance-none cursor-pointer`}>
                    <option value="MIT">MIT</option>
                    <option value="Apache-2.0">Apache 2.0</option>
                    <option value="GPL-3.0">GPL 3.0</option>
                    <option value="BSD-3-Clause">BSD 3-Clause</option>
                    <option value="proprietary">Proprietary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Repository URL</label>
                  <input value={form.repository} onChange={(e) => update("repository", e.target.value)}
                    type="url" placeholder="https://github.com/..." className={inputCls("repository")} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-4">
                <h3 className="font-semibold text-gray-300">Review your submission</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-white font-mono">{form.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Display Name</span><span className="text-white">{form.displayName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="text-white">{form.version}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-white">{CATEGORIES.find(c => c.value === form.category)?.label || form.category}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Platforms</span><span className="text-white">{form.platforms.join(", ")}</span></div>
                  {form.osTargets.length > 0 && (
                    <div className="flex justify-between"><span className="text-gray-500">OS</span><span className="text-white">{form.osTargets.join(", ")}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">Pricing</span><span className="text-white">{form.pricingModel === "free" ? "Free" : `$${form.price} (${form.pricingModel})`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">License</span><span className="text-white">{form.license}</span></div>
                </div>
                <div className="pt-3 border-t border-gray-800">
                  <p className="text-gray-500 text-xs mb-1">Description</p>
                  <p className="text-sm text-gray-300">{form.description}</p>
                </div>
                {form.longDescription && (
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-gray-500 text-xs mb-1">Full Description</p>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 max-h-48 overflow-y-auto">
                      <ReactMarkdown>{form.longDescription}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Your skill will be reviewed before going live. Usually within 24 hours.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
            {step > 1 ? (
              <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-300 transition-colors">← Back</button>
            ) : <div />}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors sm:hidden">
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
              {step < 4 ? (
                <button onClick={goNext}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-8 py-2.5 font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50">
                  {submitting ? "Submitting..." : "🚀 Submit for Review"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview sidebar */}
        <div className={`w-80 shrink-0 ${showPreview ? "block" : "hidden"} sm:block`}>
          <div className="sticky top-24">
            <p className="text-xs text-gray-500 mb-2 font-medium">LIVE PREVIEW</p>
            <SkillPreviewCard data={form} />
          </div>
        </div>
      </div>
    </div>
  );
}
