"use client";
import { useState } from "react";

interface Version {
  id: string;
  version: string;
  changelog: string | null;
  createdAt: string;
}

interface Props {
  versions: Version[];
  currentVersion: string;
  skillName: string;
}

export default function VersionHistory({ versions, currentVersion, skillName }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!versions || versions.length === 0) return null;

  const displayed = expanded ? versions : versions.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Version History</h2>
        <span className="text-sm text-gray-500">{versions.length} version{versions.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-3">
        {displayed.map((v, i) => {
          const isLatest = v.version === currentVersion;
          const date = new Date(v.createdAt).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
          });
          return (
            <div key={v.id} className={`rounded-xl border p-4 ${
              isLatest ? "border-emerald-700 bg-emerald-900/10" : "border-gray-800 bg-gray-900/50"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm">v{v.version}</span>
                  {isLatest && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                      Latest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{date}</span>
                  {!isLatest && (
                    <button
                      onClick={() => {
                        const cmd = `clawhub install ${skillName}@${v.version}`;
                        navigator.clipboard.writeText(cmd);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      title={`Install v${v.version}`}
                    >
                      Install this version
                    </button>
                  )}
                </div>
              </div>
              {v.changelog && (
                <p className="text-sm text-gray-400 mt-1 whitespace-pre-line">{v.changelog}</p>
              )}
            </div>
          );
        })}
      </div>
      {versions.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {expanded ? "Show less" : `Show all ${versions.length} versions`}
        </button>
      )}
    </div>
  );
}
