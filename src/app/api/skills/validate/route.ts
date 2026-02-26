export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { validateSkill, type SkillFiles } from "@/lib/skill-validator";

/**
 * POST /api/skills/validate
 *
 * Pre-submission quality check. Accepts skill files as JSON and returns
 * validation results without creating any records.
 *
 * Body: { files: { "skill.json": "...", "SKILL.md": "...", scripts?: {...}, allFiles?: [...] } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files = body.files as SkillFiles;

    if (!files || typeof files !== "object") {
      return NextResponse.json(
        { error: "Request body must include a 'files' object" },
        { status: 400 }
      );
    }

    const result = validateSkill(files);

    return NextResponse.json(
      {
        passed: result.passed,
        errors: result.errors,
        warnings: result.warnings,
        summary: result.passed
          ? `Passed with ${result.warnings.length} warning(s)`
          : `Failed: ${result.errors.length} error(s), ${result.warnings.length} warning(s)`,
      },
      { status: result.passed ? 200 : 422 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
