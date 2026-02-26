import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: "tutorial" | "comparison" | "listicle";
  keywords: string[];
  relatedSkills: string[]; // skill slugs for internal links
  content: string;
  readingTime: number;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { meta, content: match[2] };
}

function parseArray(val?: string): string[] {
  if (!val) return [];
  try { return JSON.parse(val.replace(/'/g, '"')); } catch { return []; }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((f) => getPost(f.replace(".md", "")))
    .filter(Boolean)
    .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime()) as BlogPost[];
}

export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta, content } = parseFrontmatter(raw);
  const words = content.split(/\s+/).length;
  return {
    slug,
    title: meta.title || slug,
    description: meta.description || "",
    date: meta.date || "2026-02-26",
    author: meta.author || "Skill Market Team",
    category: (meta.category as BlogPost["category"]) || "tutorial",
    keywords: parseArray(meta.keywords),
    relatedSkills: parseArray(meta.relatedSkills),
    content,
    readingTime: Math.max(1, Math.ceil(words / 200)),
  };
}
