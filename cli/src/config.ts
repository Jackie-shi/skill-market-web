import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";

export const API_BASE = "https://web-black-omega-44.vercel.app";

export type Platform = "openclaw" | "claude-code" | "cursor" | "windsurf" | "generic";

interface PlatformInfo {
  name: string;
  skillDir: string;
  detected: boolean;
}

/**
 * Detect which AI tool platforms are installed locally.
 */
export function detectPlatforms(): PlatformInfo[] {
  const home = homedir();
  const platforms: PlatformInfo[] = [
    {
      name: "OpenClaw",
      skillDir: join(home, ".agents", "skills"),
      detected: existsSync(join(home, ".agents")),
    },
    {
      name: "Claude Code",
      skillDir: join(home, ".claude", "skills"),
      detected:
        existsSync(join(home, ".claude")) ||
        existsSync("/usr/local/bin/claude") ||
        existsSync(join(home, ".local", "bin", "claude")),
    },
    {
      name: "Cursor",
      skillDir: join(home, ".cursor", "skills"),
      detected:
        existsSync(join(home, ".cursor")) ||
        existsSync("/Applications/Cursor.app"),
    },
    {
      name: "Windsurf",
      skillDir: join(home, ".windsurf", "skills"),
      detected:
        existsSync(join(home, ".windsurf")) ||
        existsSync("/Applications/Windsurf.app"),
    },
  ];

  return platforms;
}

/**
 * Get the install directory for a skill, auto-detecting platform.
 * Returns the first detected platform's skill dir, or ~/.skills as fallback.
 */
export function getInstallDir(platformOverride?: string): string {
  if (platformOverride) {
    const platforms = detectPlatforms();
    const match = platforms.find(
      (p) => p.name.toLowerCase().replace(/\s+/g, "-") === platformOverride
    );
    if (match) return match.skillDir;
  }

  const detected = detectPlatforms().filter((p) => p.detected);
  if (detected.length > 0) return detected[0].skillDir;

  return join(homedir(), ".skills");
}
