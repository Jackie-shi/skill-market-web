import { NextResponse } from "next/server";
import { getAllDownloadCounts } from "@/lib/downloads";

/**
 * GET /api/stats/downloads
 *
 * Returns download counts for all skills.
 * Used by admin dashboard and public stats display.
 */
export async function GET() {
  const counts = getAllDownloadCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    total,
    skills: counts,
    updatedAt: new Date().toISOString(),
  });
}
