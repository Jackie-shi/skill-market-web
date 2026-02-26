"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Skill } from "@/lib/types";

type InstallMethod = "cli" | "zip" | "git";

interface Props {
  skill: Skill;
  /** DB skill id (for paid checkout). Undefined for mock-data-only skills. */
  dbSkillId?: string;
  /** Whether the current user already purchased this skill */
  purchased?: boolean;
}

export default function InstallInstructions({ skill, dbSkillId, purchased }: Props) {
  const { status: authStatus } = useSession();
  const [method, setMethod] = useState<InstallMethod>("cli");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(skill.downloads ?? 0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isOpenClaw = skill.compatibility.platforms.includes("openclaw");
  const isPaid = skill.pricing.model === "paid" && !purchased;
  const isFree = skill.pricing.model === "free" || skill.pricing.model === "donation" || purchased;

  const commands: Record<InstallMethod, { label: string; cmd: string; steps: string[] }> = {
    cli: {
      label: "CLI",
      cmd: isOpenClaw ? `clawhub install ${skill.name}` : `npx clawhub install ${skill.name}`,
      steps: [
        isOpenClaw ? "Make sure clawhub CLI is installed (comes with OpenClaw)" : "Install clawhub globally: npm i -g clawhub",
        "Run the install command below",
        "The skill is ready to use immediately",
      ],
    },
    zip: {
      label: "Download ZIP",
      cmd: `curl -LO https://clawhub.com/skills/${skill.name}/latest.zip`,
      steps: [
        "Download the ZIP archive",
        isOpenClaw ? `Extract to ~/.agents/skills/${skill.name}/` : "Extract to your project's skills directory",
        "Restart your AI tool to load the skill",
      ],
    },
    git: {
      label: "Git Clone",
      cmd: `git clone https://clawhub.com/skills/${skill.name}.git`,
      steps: [
        "Clone the repository",
        isOpenClaw ? `Move to ~/.agents/skills/${skill.name}/` : "Place in your skills directory",
        "Restart your AI tool to load the skill",
      ],
    },
  };

  const current = commands[method];

  async function copyCommand() {
    await navigator.clipboard.writeText(current.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleBuy() {
    if (authStatus !== "authenticated") {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!dbSkillId) {
      alert("This skill is not yet available for purchase.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: dbSkillId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Already purchased — reload to show download
        window.location.reload();
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch {
      alert("Network error — please try again");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ format: method });
      const res = await fetch(`/api/skills/${skill.name}/download?${params}`);
      const data = await res.json();

      if (res.status === 402) {
        handleBuy();
        return;
      }

      if (data.totalDownloads) {
        setDownloadCount(data.totalDownloads);
      }
    } catch {
      // silent fail
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Install</h3>
        <span className="text-xs text-gray-500">{downloadCount.toLocaleString()} downloads</span>
      </div>

      {/* Method tabs */}
      <div className="flex rounded-lg bg-gray-950 p-0.5">
        {(Object.keys(commands) as InstallMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              method === m ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {commands[m].label}
          </button>
        ))}
      </div>

      {/* Command */}
      <div
        className="relative rounded-lg bg-gray-950 p-3 font-mono text-sm text-emerald-400 break-all cursor-pointer group"
        onClick={copyCommand}
        title="Click to copy"
      >
        <span>{current.cmd}</span>
        <span className="absolute right-2 top-2 text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
          {copied ? "✓ Copied" : "📋"}
        </span>
      </div>

      {/* Steps */}
      <ol className="space-y-2 text-sm text-gray-400">
        {current.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-emerald-500 font-medium shrink-0">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {/* Platform compatibility note */}
      <div className="text-xs text-gray-600 border-t border-gray-800 pt-3">
        Works with:{" "}
        {skill.compatibility.platforms.map((p) => (
          <span key={p} className="inline-block mr-1.5 capitalize">
            {p === "claude-code" ? "Claude Code" : p === "openclaw" ? "OpenClaw" : p}
          </span>
        ))}
      </div>

      {/* Action button */}
      {isPaid ? (
        <button
          onClick={handleBuy}
          disabled={checkoutLoading}
          className={`w-full rounded-lg py-2.5 font-medium text-white transition-colors ${
            checkoutLoading ? "bg-gray-700 cursor-wait" : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          {checkoutLoading ? "Redirecting to checkout..." : `Buy & Install — $${skill.pricing.price}`}
        </button>
      ) : (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full rounded-lg py-2.5 font-medium text-white transition-colors ${
            downloading ? "bg-gray-700 cursor-wait" : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          {downloading
            ? "Processing..."
            : purchased
              ? "Download (Purchased ✓)"
              : skill.pricing.model === "freemium"
                ? "Install (Free Trial)"
                : "Install Free"}
        </button>
      )}

      {skill.pricing.model === "freemium" && skill.pricing.trialDays && (
        <p className="text-xs text-gray-500 text-center">
          {skill.pricing.trialDays}-day free trial, then ${skill.pricing.price}/one-time
        </p>
      )}
    </div>
  );
}
