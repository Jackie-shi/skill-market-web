// src/config.ts
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";
var API_BASE = "https://web-black-omega-44.vercel.app";
function detectPlatforms() {
  const home = homedir();
  const platforms = [
    {
      name: "OpenClaw",
      skillDir: join(home, ".agents", "skills"),
      detected: existsSync(join(home, ".agents"))
    },
    {
      name: "Claude Code",
      skillDir: join(home, ".claude", "skills"),
      detected: existsSync(join(home, ".claude")) || existsSync("/usr/local/bin/claude") || existsSync(join(home, ".local", "bin", "claude"))
    },
    {
      name: "Cursor",
      skillDir: join(home, ".cursor", "skills"),
      detected: existsSync(join(home, ".cursor")) || existsSync("/Applications/Cursor.app")
    },
    {
      name: "Windsurf",
      skillDir: join(home, ".windsurf", "skills"),
      detected: existsSync(join(home, ".windsurf")) || existsSync("/Applications/Windsurf.app")
    }
  ];
  return platforms;
}
function getInstallDir(platformOverride) {
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

// src/api.ts
async function searchSkills(query, category) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const res = await fetch(`${API_BASE}/api/skills?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}
async function getSkillDetail(slug) {
  const res = await fetch(`${API_BASE}/api/skills/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Skill "${slug}" not found`);
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
async function getDownloadInfo(slug) {
  const res = await fetch(`${API_BASE}/api/skills/${slug}/download`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Skill "${slug}" not found`);
    if (res.status === 402) throw new Error(`Skill "${slug}" requires payment`);
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export {
  detectPlatforms,
  getInstallDir,
  searchSkills,
  getSkillDetail,
  getDownloadInfo
};
