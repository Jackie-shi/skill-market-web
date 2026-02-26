/**
 * Simple semver validation and comparison utilities.
 * Supports standard semver: MAJOR.MINOR.PATCH with optional pre-release suffix.
 */

const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/;

export function isValidSemver(version: string): boolean {
  return SEMVER_REGEX.test(version);
}

/** Parse semver into comparable parts. Returns null if invalid. */
export function parseSemver(version: string) {
  const match = version.match(SEMVER_REGEX);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    build: match[5] || null,
  };
}

/**
 * Compare two semver strings.
 * Returns: 1 if a > b, -1 if a < b, 0 if equal.
 * Returns null if either is invalid.
 */
export function compareSemver(a: string, b: string): number | null {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return null;

  if (pa.major !== pb.major) return pa.major > pb.major ? 1 : -1;
  if (pa.minor !== pb.minor) return pa.minor > pb.minor ? 1 : -1;
  if (pa.patch !== pb.patch) return pa.patch > pb.patch ? 1 : -1;

  // Pre-release has lower precedence than release
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && pb.prerelease) return 1;

  return 0;
}
