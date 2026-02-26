/**
 * Download tracking — in-memory for MVP, backed by a simple map.
 * Production: replace with DB (Postgres/Redis).
 */

const downloadCounts = new Map<string, number>();

// Pre-seed with existing mock data counts
const SEED_COUNTS: Record<string, number> = {
  "api-docs-generator": 1243,
  "git-commit-helper": 2891,
  "weather-briefing": 567,
  "k8s-troubleshooter": 892,
  "sql-query-optimizer": 1567,
  "react-component-gen": 3210,
  "ci-pipeline-builder": 445,
  "blog-post-writer": 234,
  "test-generator": 1890,
  "daily-standup": 678,
};

// Initialize
for (const [slug, count] of Object.entries(SEED_COUNTS)) {
  downloadCounts.set(slug, count);
}

export function trackDownload(slug: string): void {
  const current = downloadCounts.get(slug) ?? 0;
  downloadCounts.set(slug, current + 1);
}

export function getDownloadCount(slug: string): number {
  return downloadCounts.get(slug) ?? 0;
}

export function getAllDownloadCounts(): Record<string, number> {
  return Object.fromEntries(downloadCounts);
}
