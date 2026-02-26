export interface SkillAuthor {
  name: string;
  email?: string;
  url?: string;
}

export interface SkillPricing {
  model: "free" | "paid" | "freemium" | "donation";
  price?: number | null;
  currency?: "USD" | null;
  trialDays?: number | null;
}

export interface SkillCompatibility {
  platforms: ("openclaw" | "claude-code" | "cursor" | "windsurf" | "generic")[];
  minVersion?: string;
  maxVersion?: string | null;
  os?: ("darwin" | "linux" | "win32")[];
}

export type SkillCategory =
  | "development"
  | "devops"
  | "productivity"
  | "communication"
  | "content"
  | "data"
  | "design"
  | "finance"
  | "education"
  | "other";

export interface Skill {
  name: string;
  version: string;
  displayName: string;
  description: string;
  longDescription?: string;
  author: SkillAuthor;
  license?: string;
  repository?: string;
  homepage?: string;
  keywords?: string[];
  category: SkillCategory;
  compatibility: SkillCompatibility;
  pricing: SkillPricing;
  // UI-only fields (not in schema but needed for marketplace display)
  downloads?: number;
  rating?: number;
  ratingCount?: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
