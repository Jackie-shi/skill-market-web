import { API_BASE } from "./config.js";

export interface SkillResult {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  version: string;
  downloads: number;
  pricingModel: string;
  price: number | null;
  platforms: string;
  author: { name: string; image: string | null } | null;
}

export interface SearchResponse {
  skills: SkillResult[];
  categoryCounts: Record<string, number>;
}

export interface DownloadResponse {
  skill: string;
  version: string;
  format: string;
  totalDownloads: number;
  install: {
    method: string;
    commands?: Record<string, string>;
    instructions: string[];
  };
}

export interface SkillDetail {
  id: string;
  name: string;
  displayName: string;
  description: string;
  longDescription: string | null;
  category: string;
  version: string;
  downloads: number;
  pricingModel: string;
  price: number | null;
  platforms: string;
  keywords: string | null;
  installCommand: string | null;
  author: { name: string; image: string | null } | null;
}

/**
 * Search skills on the platform
 */
export async function searchSkills(
  query?: string,
  category?: string
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);

  const res = await fetch(`${API_BASE}/api/skills?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Get skill detail by slug
 */
export async function getSkillDetail(slug: string): Promise<SkillDetail> {
  const res = await fetch(`${API_BASE}/api/skills/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Skill "${slug}" not found`);
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Get download info for a skill
 */
export async function getDownloadInfo(
  slug: string
): Promise<DownloadResponse> {
  const res = await fetch(`${API_BASE}/api/skills/${slug}/download`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Skill "${slug}" not found`);
    if (res.status === 402) throw new Error(`Skill "${slug}" requires payment`);
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
