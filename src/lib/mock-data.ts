import { Skill, SkillCategory } from "./types";

export const CATEGORIES: { value: SkillCategory; label: string; icon: string; count: number }[] = [
  { value: "development", label: "Development", icon: "💻", count: 4 },
  { value: "devops", label: "DevOps", icon: "🚀", count: 2 },
  { value: "productivity", label: "Productivity", icon: "⚡", count: 2 },
  { value: "content", label: "Content", icon: "✍️", count: 1 },
  { value: "data", label: "Data", icon: "📊", count: 1 },
  { value: "communication", label: "Communication", icon: "💬", count: 0 },
  { value: "design", label: "Design", icon: "🎨", count: 0 },
  { value: "finance", label: "Finance", icon: "💰", count: 0 },
  { value: "education", label: "Education", icon: "📚", count: 0 },
  { value: "other", label: "Other", icon: "📦", count: 0 },
];

export const SKILLS: Skill[] = [
  {
    name: "api-docs-generator",
    version: "1.0.0",
    displayName: "API Docs Generator",
    description: "Auto-generate comprehensive API documentation from code comments and type definitions.",
    longDescription: `API Docs Generator scans your codebase for JSDoc/TSDoc comments, type definitions, and route handlers, then produces clean Markdown documentation.\n\n## Features\n- TypeScript-aware type extraction\n- Express/Fastify/Next.js route detection\n- OpenAPI 3.0 spec generation\n- Customizable templates\n- Incremental updates (only re-generates changed files)\n\n## How it works\n1. Point it at your source directory\n2. The skill analyzes exports, types, and comments\n3. Generates structured docs in your preferred format\n\nPerfect for keeping docs in sync with code without manual effort.`,
    author: { name: "SkillMarket Team", url: "https://skillmarket.dev" },
    license: "MIT",
    keywords: ["api", "documentation", "typescript", "openapi"],
    category: "development",
    compatibility: { platforms: ["claude-code", "openclaw"], os: ["darwin", "linux", "win32"] },
    pricing: { model: "free" },
    downloads: 1243,
    rating: 4.8,
    ratingCount: 56,
    featured: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-02-20",
  },
  {
    name: "git-commit-helper",
    version: "1.2.0",
    displayName: "Git Commit Helper",
    description: "Generate meaningful, conventional commit messages from staged changes.",
    longDescription: `Never write a vague "fix stuff" commit again. Git Commit Helper analyzes your staged diff and produces a conventional commit message.\n\n## Features\n- Conventional Commits format (feat/fix/chore/docs/...)\n- Multi-file change summarization\n- Breaking change detection\n- Scope inference from file paths\n- Configurable commit style\n\n## Usage\nStage your changes, then let the skill generate the message. Review, tweak if needed, commit.`,
    author: { name: "DevTools Inc.", url: "https://devtools.example.com" },
    license: "MIT",
    keywords: ["git", "commit", "conventional-commits", "automation"],
    category: "development",
    compatibility: { platforms: ["claude-code", "openclaw", "cursor"], os: ["darwin", "linux", "win32"] },
    pricing: { model: "free" },
    downloads: 2891,
    rating: 4.9,
    ratingCount: 124,
    featured: true,
    createdAt: "2025-12-01",
    updatedAt: "2026-02-18",
  },
  {
    name: "weather-briefing",
    version: "1.0.0",
    displayName: "Weather Briefing",
    description: "Get concise weather forecasts and alerts integrated into your daily workflow.",
    longDescription: `Start your day with a quick weather check without leaving your terminal.\n\n## Features\n- Current conditions + 5-day forecast\n- Severe weather alerts\n- Location auto-detection or manual override\n- Sunrise/sunset times\n- UV index and air quality\n\nSimple, fast, no API key required (uses free weather services).`,
    author: { name: "SkillMarket Team" },
    license: "MIT",
    keywords: ["weather", "forecast", "daily", "productivity"],
    category: "productivity",
    compatibility: { platforms: ["openclaw", "generic"] },
    pricing: { model: "free" },
    downloads: 567,
    rating: 4.5,
    ratingCount: 23,
    featured: false,
    createdAt: "2026-02-01",
    updatedAt: "2026-02-10",
  },
  {
    name: "k8s-troubleshooter",
    version: "2.0.1",
    displayName: "K8s Troubleshooter",
    description: "Diagnose and fix common Kubernetes issues with guided troubleshooting flows.",
    longDescription: `When pods crash, services don't respond, or deployments hang — this skill walks through a structured diagnosis.\n\n## Covers\n- CrashLoopBackOff analysis\n- OOMKilled detection & resource tuning\n- Service/Ingress connectivity checks\n- PVC binding issues\n- RBAC permission errors\n- Node pressure & scheduling problems\n\nRequires kubectl access to the target cluster.`,
    author: { name: "CloudOps Labs", email: "skills@cloudops.dev" },
    license: "Apache-2.0",
    keywords: ["kubernetes", "k8s", "devops", "troubleshooting", "debugging"],
    category: "devops",
    compatibility: { platforms: ["claude-code", "openclaw"], os: ["darwin", "linux"] },
    pricing: { model: "paid", price: 4.99, currency: "USD" },
    downloads: 892,
    rating: 4.7,
    ratingCount: 41,
    featured: true,
    createdAt: "2026-01-20",
    updatedAt: "2026-02-22",
  },
  {
    name: "sql-query-optimizer",
    version: "1.1.0",
    displayName: "SQL Query Optimizer",
    description: "Analyze slow SQL queries and suggest index/rewrite optimizations.",
    longDescription: `Paste a slow query + EXPLAIN output, get actionable optimization advice.\n\n## Features\n- Query plan analysis\n- Index recommendations\n- Query rewrite suggestions\n- JOIN optimization\n- Subquery → CTE refactoring\n- Supports PostgreSQL, MySQL, SQLite`,
    author: { name: "DataCraft", url: "https://datacraft.dev" },
    license: "MIT",
    keywords: ["sql", "database", "optimization", "postgresql", "mysql"],
    category: "data",
    compatibility: { platforms: ["claude-code", "openclaw", "cursor", "windsurf"], os: ["darwin", "linux", "win32"] },
    pricing: { model: "freemium", price: 2.99, currency: "USD", trialDays: 14 },
    downloads: 1567,
    rating: 4.6,
    ratingCount: 78,
    featured: true,
    createdAt: "2026-01-05",
    updatedAt: "2026-02-25",
  },
  {
    name: "react-component-gen",
    version: "1.3.0",
    displayName: "React Component Generator",
    description: "Scaffold React components with tests, stories, and proper TypeScript types.",
    longDescription: `Describe what you need, get a full component with all the fixings.\n\n## Generates\n- Component file (TSX)\n- Unit tests (Vitest/Jest)\n- Storybook story\n- CSS Module or Tailwind styles\n- Barrel export\n\n## Conventions\n- Follows your project's existing patterns\n- Infers prop types from description\n- Accessibility-first (ARIA attributes included)`,
    author: { name: "ReactForge", url: "https://reactforge.dev" },
    license: "MIT",
    keywords: ["react", "component", "typescript", "scaffold", "storybook"],
    category: "development",
    compatibility: { platforms: ["claude-code", "cursor", "windsurf"], os: ["darwin", "linux", "win32"] },
    pricing: { model: "free" },
    downloads: 3210,
    rating: 4.8,
    ratingCount: 167,
    featured: false,
    createdAt: "2025-11-20",
    updatedAt: "2026-02-15",
  },
  {
    name: "ci-pipeline-builder",
    version: "1.0.0",
    displayName: "CI Pipeline Builder",
    description: "Generate GitHub Actions, GitLab CI, or CircleCI configs from project analysis.",
    longDescription: `Analyzes your project structure and generates a production-ready CI/CD pipeline.\n\n## Supports\n- GitHub Actions\n- GitLab CI\n- CircleCI\n\n## Detects\n- Language/framework (Node, Python, Go, Rust, etc.)\n- Test runners\n- Docker usage\n- Deployment targets\n\nIncludes caching, parallelization, and security scanning steps.`,
    author: { name: "CloudOps Labs" },
    license: "MIT",
    keywords: ["ci", "cd", "github-actions", "gitlab", "automation"],
    category: "devops",
    compatibility: { platforms: ["claude-code", "openclaw"] },
    pricing: { model: "free" },
    downloads: 445,
    rating: 4.3,
    ratingCount: 19,
    featured: false,
    createdAt: "2026-02-10",
    updatedAt: "2026-02-20",
  },
  {
    name: "blog-post-writer",
    version: "1.0.0",
    displayName: "Blog Post Writer",
    description: "Draft SEO-optimized blog posts with proper structure, meta tags, and internal linking.",
    longDescription: `Give a topic and target audience — get a well-structured blog post draft.\n\n## Features\n- SEO title & meta description\n- Header hierarchy (H1-H4)\n- Internal/external link suggestions\n- Image alt text placeholders\n- Reading time estimate\n- Multiple tone options (technical, casual, professional)`,
    author: { name: "ContentAI" },
    license: "MIT",
    keywords: ["blog", "seo", "content", "writing", "marketing"],
    category: "content",
    compatibility: { platforms: ["openclaw", "generic"] },
    pricing: { model: "paid", price: 1.99, currency: "USD" },
    downloads: 234,
    rating: 4.2,
    ratingCount: 12,
    featured: false,
    createdAt: "2026-02-15",
    updatedAt: "2026-02-22",
  },
  {
    name: "test-generator",
    version: "2.1.0",
    displayName: "Test Generator",
    description: "Generate comprehensive unit and integration tests from existing code.",
    longDescription: `Point at a function or module — get thorough tests covering happy paths, edge cases, and error conditions.\n\n## Features\n- Jest/Vitest/Mocha support\n- Pytest support\n- Go testing support\n- Edge case generation\n- Mock/stub scaffolding\n- Coverage gap analysis`,
    author: { name: "TestCraft Labs", url: "https://testcraft.dev" },
    license: "MIT",
    keywords: ["testing", "unit-test", "jest", "pytest", "automation"],
    category: "development",
    compatibility: { platforms: ["claude-code", "openclaw", "cursor", "windsurf"], os: ["darwin", "linux", "win32"] },
    pricing: { model: "donation" },
    downloads: 1890,
    rating: 4.7,
    ratingCount: 93,
    featured: false,
    createdAt: "2025-12-15",
    updatedAt: "2026-02-24",
  },
  {
    name: "daily-standup",
    version: "1.0.0",
    displayName: "Daily Standup",
    description: "Auto-generate standup summaries from git history and task boards.",
    longDescription: `No more "what did I do yesterday?" moments.\n\n## How it works\n1. Scans git commits from last 24h\n2. Checks linked task board (GitHub Issues, Linear, Jira)\n3. Generates a structured standup:\n   - ✅ Done yesterday\n   - 🔄 In progress\n   - 🎯 Plan for today\n   - 🚧 Blockers\n\nPaste-ready for Slack, Teams, or Discord.`,
    author: { name: "ProductiveAI" },
    license: "MIT",
    keywords: ["standup", "agile", "git", "productivity", "team"],
    category: "productivity",
    compatibility: { platforms: ["openclaw", "claude-code"] },
    pricing: { model: "free" },
    downloads: 678,
    rating: 4.4,
    ratingCount: 31,
    featured: false,
    createdAt: "2026-01-25",
    updatedAt: "2026-02-18",
  },
];

export function getSkillBySlug(slug: string): Skill | undefined {
  return SKILLS.find((s) => s.name === slug);
}

export function searchSkills(query: string, category?: SkillCategory, sort?: string): Skill[] {
  let results = [...SKILLS];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keywords?.some((k) => k.toLowerCase().includes(q)) ||
        s.category.includes(q)
    );
  }

  if (category) {
    results = results.filter((s) => s.category === category);
  }

  switch (sort) {
    case "downloads":
      results.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
      break;
    case "rating":
      results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "newest":
      results.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      break;
    case "updated":
      results.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
      break;
    default:
      // relevance — featured first, then downloads
      results.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.downloads ?? 0) - (a.downloads ?? 0);
      });
  }

  return results;
}
