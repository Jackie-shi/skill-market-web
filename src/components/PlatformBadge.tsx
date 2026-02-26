const PLATFORM_COLORS: Record<string, string> = {
  openclaw: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "claude-code": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  cursor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  windsurf: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  generic: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PLATFORM_LABELS: Record<string, string> = {
  openclaw: "OpenClaw",
  "claude-code": "Claude Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  generic: "Generic",
};

export default function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.generic}`}>
      {PLATFORM_LABELS[platform] ?? platform}
    </span>
  );
}
