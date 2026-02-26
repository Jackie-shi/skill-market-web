/**
 * Skill Quality Validator
 *
 * Automated quality checks for skill submissions:
 * 1. Required files (SKILL.md, skill.json)
 * 2. skill.json schema validation
 * 3. Security scanning (dangerous commands)
 * 4. Platform compatibility verification
 */

// ── Types ──

export interface ValidationResult {
  passed: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidationIssue {
  code: string;
  message: string;
  field?: string;
  severity: "error" | "warning";
}

export interface SkillJson {
  name?: string;
  displayName?: string;
  version?: string;
  description?: string;
  platforms?: string[];
  category?: string;
  author?: string;
  license?: string;
  keywords?: string[];
  os?: string[];
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export interface SkillFiles {
  "skill.json"?: string;
  "SKILL.md"?: string;
  scripts?: Record<string, string>; // filename -> content
  allFiles?: string[]; // list of all filenames in the package
}

// ── Constants ──

const ALLOWED_PLATFORMS = [
  "claude-code",
  "openclaw",
  "cursor",
  "windsurf",
  "copilot",
  "aider",
  "cline",
  "roo-code",
  "augment",
  "amp",
  "opencode",
];

const ALLOWED_CATEGORIES = [
  "coding",
  "devops",
  "writing",
  "research",
  "data",
  "design",
  "productivity",
  "other",
];

const ALLOWED_OS = ["macos", "linux", "windows"];

const NAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

// Security patterns: [regex, severity, description]
const DANGEROUS_PATTERNS: [RegExp, "error" | "warning", string][] = [
  // Critical - immediate reject
  [/rm\s+-rf\s+\/(?!\w)/, "error", "Destructive command: rm -rf /"],
  [/rm\s+-rf\s+~/, "error", "Destructive command: rm -rf ~"],
  [/rm\s+-rf\s+\$HOME/, "error", "Destructive command: rm -rf $HOME"],
  [/rm\s+-rf\s+\$\{HOME\}/, "error", "Destructive command: rm -rf ${HOME}"],
  [/curl\s.*\|\s*(sh|bash|zsh)/, "error", "Remote code execution: curl | shell"],
  [/wget\s.*\|\s*(sh|bash|zsh)/, "error", "Remote code execution: wget | shell"],
  [/eval\s+"\$\(curl/, "error", "Remote code execution: eval $(curl ...)"],
  [/eval\s+"\$\(wget/, "error", "Remote code execution: eval $(wget ...)"],
  [/:\(\)\{\s*:\|:&\s*\};:/, "error", "Fork bomb detected"],
  [/mkfs\./, "error", "Disk format command detected"],
  [/>\s*\/dev\/sd/, "error", "Direct disk write detected"],
  [/>\s*\/dev\/nvme/, "error", "Direct disk write detected"],
  // Warning - flag for reviewer
  [/chmod\s+777/, "warning", "Overly permissive: chmod 777"],
  [/sudo\s/, "warning", "Privilege escalation: sudo"],
  [/dd\s+if=/, "warning", "Disk write: dd"],
  [/base64\s+(-d|--decode)\s*\|/, "warning", "Encoded execution: base64 decode | pipe"],
  [/python[3]?\s+-c\s+["']import\s+os/, "warning", "Dynamic code execution via python"],
  [/node\s+-e\s/, "warning", "Dynamic code execution via node -e"],
];

// ── Validators ──

function validateRequiredFiles(files: SkillFiles): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!files["skill.json"]) {
    issues.push({
      code: "MISSING_SKILL_JSON",
      message: "skill.json is required",
      severity: "error",
    });
  }

  if (!files["SKILL.md"]) {
    issues.push({
      code: "MISSING_SKILL_MD",
      message: "SKILL.md is required",
      severity: "error",
    });
  } else if (files["SKILL.md"].length < 50) {
    issues.push({
      code: "SKILL_MD_TOO_SHORT",
      message: "SKILL.md must be at least 50 characters",
      severity: "error",
    });
  }

  return issues;
}

function validateSkillJson(raw: string): {
  issues: ValidationIssue[];
  parsed?: SkillJson;
} {
  const issues: ValidationIssue[] = [];
  let parsed: SkillJson;

  try {
    parsed = JSON.parse(raw);
  } catch {
    issues.push({
      code: "INVALID_JSON",
      message: "skill.json is not valid JSON",
      severity: "error",
    });
    return { issues };
  }

  // Required fields
  if (!parsed.name || typeof parsed.name !== "string") {
    issues.push({
      code: "MISSING_NAME",
      message: "name is required",
      field: "name",
      severity: "error",
    });
  } else {
    if (!NAME_REGEX.test(parsed.name)) {
      issues.push({
        code: "INVALID_NAME_FORMAT",
        message:
          "name must be lowercase alphanumeric with hyphens (e.g. my-skill)",
        field: "name",
        severity: "error",
      });
    }
    if (parsed.name.length < 3 || parsed.name.length > 50) {
      issues.push({
        code: "INVALID_NAME_LENGTH",
        message: "name must be 3-50 characters",
        field: "name",
        severity: "error",
      });
    }
  }

  if (!parsed.displayName || typeof parsed.displayName !== "string") {
    issues.push({
      code: "MISSING_DISPLAY_NAME",
      message: "displayName is required",
      field: "displayName",
      severity: "error",
    });
  } else if (parsed.displayName.length < 3 || parsed.displayName.length > 100) {
    issues.push({
      code: "INVALID_DISPLAY_NAME_LENGTH",
      message: "displayName must be 3-100 characters",
      field: "displayName",
      severity: "error",
    });
  }

  if (!parsed.version || typeof parsed.version !== "string") {
    issues.push({
      code: "MISSING_VERSION",
      message: "version is required",
      field: "version",
      severity: "error",
    });
  } else if (!SEMVER_REGEX.test(parsed.version)) {
    issues.push({
      code: "INVALID_VERSION",
      message: "version must be semver (e.g. 1.0.0)",
      field: "version",
      severity: "error",
    });
  }

  if (!parsed.description || typeof parsed.description !== "string") {
    issues.push({
      code: "MISSING_DESCRIPTION",
      message: "description is required",
      field: "description",
      severity: "error",
    });
  } else if (parsed.description.length < 10 || parsed.description.length > 500) {
    issues.push({
      code: "INVALID_DESCRIPTION_LENGTH",
      message: "description must be 10-500 characters",
      field: "description",
      severity: "error",
    });
  }

  if (!parsed.platforms || !Array.isArray(parsed.platforms) || parsed.platforms.length === 0) {
    issues.push({
      code: "MISSING_PLATFORMS",
      message: "At least one platform is required",
      field: "platforms",
      severity: "error",
    });
  } else {
    const invalid = parsed.platforms.filter((p) => !ALLOWED_PLATFORMS.includes(p));
    if (invalid.length > 0) {
      issues.push({
        code: "INVALID_PLATFORM",
        message: `Unknown platforms: ${invalid.join(", ")}. Allowed: ${ALLOWED_PLATFORMS.join(", ")}`,
        field: "platforms",
        severity: "error",
      });
    }
  }

  if (!parsed.category || typeof parsed.category !== "string") {
    issues.push({
      code: "MISSING_CATEGORY",
      message: "category is required",
      field: "category",
      severity: "error",
    });
  } else if (!ALLOWED_CATEGORIES.includes(parsed.category)) {
    issues.push({
      code: "INVALID_CATEGORY",
      message: `Unknown category: ${parsed.category}. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`,
      field: "category",
      severity: "error",
    });
  }

  if (!parsed.author || typeof parsed.author !== "string") {
    issues.push({
      code: "MISSING_AUTHOR",
      message: "author is required",
      field: "author",
      severity: "error",
    });
  }

  // Optional field validation
  if (parsed.os && Array.isArray(parsed.os)) {
    const invalidOs = parsed.os.filter((o) => !ALLOWED_OS.includes(o));
    if (invalidOs.length > 0) {
      issues.push({
        code: "INVALID_OS",
        message: `Unknown OS targets: ${invalidOs.join(", ")}. Allowed: ${ALLOWED_OS.join(", ")}`,
        field: "os",
        severity: "error",
      });
    }
  }

  return { issues, parsed };
}

function scanSecurity(files: SkillFiles): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Collect all scannable content
  const scanTargets: { name: string; content: string }[] = [];

  if (files["SKILL.md"]) {
    scanTargets.push({ name: "SKILL.md", content: files["SKILL.md"] });
  }

  if (files.scripts) {
    for (const [name, content] of Object.entries(files.scripts)) {
      scanTargets.push({ name: `scripts/${name}`, content });
    }
  }

  // Also scan skill.json scripts field
  if (files["skill.json"]) {
    try {
      const json = JSON.parse(files["skill.json"]);
      if (json.scripts && typeof json.scripts === "object") {
        for (const [key, val] of Object.entries(json.scripts)) {
          if (typeof val === "string") {
            scanTargets.push({ name: `skill.json scripts.${key}`, content: val });
          }
        }
      }
    } catch {
      // Already caught in schema validation
    }
  }

  for (const target of scanTargets) {
    for (const [pattern, severity, description] of DANGEROUS_PATTERNS) {
      if (pattern.test(target.content)) {
        issues.push({
          code: "SECURITY_" + (severity === "error" ? "CRITICAL" : "WARNING"),
          message: `${description} (in ${target.name})`,
          field: target.name,
          severity,
        });
      }
    }
  }

  return issues;
}

function validatePlatformCompatibility(
  skillJson: SkillJson,
  files: SkillFiles
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!skillJson.platforms || !Array.isArray(skillJson.platforms)) return issues;

  const allFiles = files.allFiles || [];
  const skillMd = (files["SKILL.md"] || "").toLowerCase();

  const platformChecks: Record<string, () => boolean> = {
    cursor: () =>
      allFiles.includes(".cursorrules") || skillMd.includes("cursor"),
    windsurf: () =>
      allFiles.includes(".windsurfrules") || skillMd.includes("windsurf"),
    copilot: () =>
      allFiles.includes(".github/copilot-instructions.md") ||
      skillMd.includes("copilot"),
    "claude-code": () =>
      skillMd.includes("claude code") || skillMd.includes("claude-code"),
    openclaw: () =>
      skillMd.includes("openclaw") || skillMd.includes("open claw"),
  };

  for (const platform of skillJson.platforms) {
    const check = platformChecks[platform];
    if (check && !check()) {
      issues.push({
        code: "COMPAT_MISSING",
        message: `Platform "${platform}" declared but no corresponding config or mention found`,
        field: "platforms",
        severity: "warning",
      });
    }
  }

  return issues;
}

// ── Main Validator ──

export function validateSkill(files: SkillFiles): ValidationResult {
  const allIssues: ValidationIssue[] = [];

  // 1. Required files
  allIssues.push(...validateRequiredFiles(files));

  // 2. skill.json schema (only if file exists)
  let parsedJson: SkillJson | undefined;
  if (files["skill.json"]) {
    const { issues, parsed } = validateSkillJson(files["skill.json"]);
    allIssues.push(...issues);
    parsedJson = parsed;
  }

  // 3. Security scan
  allIssues.push(...scanSecurity(files));

  // 4. Platform compatibility (only if we have valid json)
  if (parsedJson) {
    allIssues.push(...validatePlatformCompatibility(parsedJson, files));
  }

  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Quick validation for the submit API — validates against form data
 * (not file-based, since we don't have file uploads yet).
 * This adds quality checks on top of the existing basic validation.
 */
export function validateSubmission(body: Record<string, unknown>): ValidationResult {
  const issues: ValidationIssue[] = [];

  const name = body.name as string | undefined;
  const description = body.description as string | undefined;
  const longDescription = body.longDescription as string | undefined;
  const platforms = body.platforms as string[] | undefined;
  const category = body.category as string | undefined;
  const version = body.version as string | undefined;

  // Enhanced name validation
  if (name) {
    if (!NAME_REGEX.test(name)) {
      issues.push({
        code: "INVALID_NAME_FORMAT",
        message: "Skill name must be lowercase alphanumeric with hyphens, starting and ending with alphanumeric",
        field: "name",
        severity: "error",
      });
    }
    if (name.length < 3 || name.length > 50) {
      issues.push({
        code: "INVALID_NAME_LENGTH",
        message: "Skill name must be 3-50 characters",
        field: "name",
        severity: "error",
      });
    }
  }

  // Version must be semver
  if (version && !SEMVER_REGEX.test(version)) {
    issues.push({
      code: "INVALID_VERSION",
      message: "Version must follow semver format (e.g. 1.0.0)",
      field: "version",
      severity: "error",
    });
  }

  // Description quality
  if (description && description.length < 10) {
    issues.push({
      code: "DESCRIPTION_TOO_SHORT",
      message: "Description must be at least 10 characters",
      field: "description",
      severity: "error",
    });
  }

  // Platform validation
  if (platforms && Array.isArray(platforms)) {
    const invalid = platforms.filter((p) => !ALLOWED_PLATFORMS.includes(p));
    if (invalid.length > 0) {
      issues.push({
        code: "INVALID_PLATFORM",
        message: `Unknown platforms: ${invalid.join(", ")}`,
        field: "platforms",
        severity: "error",
      });
    }
  }

  // Category validation
  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    issues.push({
      code: "INVALID_CATEGORY",
      message: `Unknown category: ${category}. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`,
      field: "category",
      severity: "error",
    });
  }

  // Security scan on longDescription (if provided)
  if (longDescription) {
    for (const [pattern, severity, desc] of DANGEROUS_PATTERNS) {
      if (pattern.test(longDescription)) {
        issues.push({
          code: "SECURITY_" + (severity === "error" ? "CRITICAL" : "WARNING"),
          message: `${desc} (in longDescription)`,
          field: "longDescription",
          severity,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// Export constants for use in other modules
export { ALLOWED_PLATFORMS, ALLOWED_CATEGORIES, ALLOWED_OS };
