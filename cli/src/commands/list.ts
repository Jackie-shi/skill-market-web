import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { detectPlatforms } from "../config.js";

/**
 * List locally installed skills
 */
export async function listCommand(options: { dir?: string }) {
  const platforms = detectPlatforms();
  const dirsToScan: { name: string; dir: string }[] = [];

  if (options.dir) {
    dirsToScan.push({ name: "Custom", dir: options.dir });
  } else {
    // Scan all detected platform dirs + fallback
    for (const p of platforms) {
      if (existsSync(p.skillDir)) {
        dirsToScan.push({ name: p.name, dir: p.skillDir });
      }
    }
    // Also check ~/.skills fallback
    const fallback = join(process.env.HOME || "", ".skills");
    if (existsSync(fallback) && !dirsToScan.some((d) => d.dir === fallback)) {
      dirsToScan.push({ name: "Default", dir: fallback });
    }
  }

  if (dirsToScan.length === 0) {
    console.log(chalk.yellow("No skill directories found."));
    console.log(chalk.dim("Install a skill first: npx skillmarket install <name>"));
    return;
  }

  let totalSkills = 0;

  for (const { name, dir } of dirsToScan) {
    const skills = scanSkillDir(dir);
    if (skills.length === 0) continue;

    totalSkills += skills.length;
    console.log(chalk.bold.cyan(`${name}`) + chalk.dim(` (${dir})`));
    console.log();

    for (const skill of skills) {
      const version = skill.version ? chalk.dim(`v${skill.version}`) : "";
      const source = skill.installedFrom
        ? chalk.dim(`from ${skill.installedFrom}`)
        : "";

      console.log(
        `  ${chalk.bold(skill.displayName || skill.name)} ${version} ${source}`
      );
      if (skill.description) {
        console.log(`  ${chalk.dim(skill.description)}`);
      }
      console.log();
    }
  }

  if (totalSkills === 0) {
    console.log(chalk.yellow("No skills installed."));
    console.log(chalk.dim("Install one: npx skillmarket install <name>"));
  } else {
    console.log(chalk.dim(`Total: ${totalSkills} skill${totalSkills !== 1 ? "s" : ""}`));
  }
}

interface InstalledSkill {
  name: string;
  displayName?: string;
  version?: string;
  description?: string;
  installedFrom?: string;
}

function scanSkillDir(dir: string): InstalledSkill[] {
  const skills: InstalledSkill[] = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillJsonPath = join(dir, entry.name, "skill.json");
      const skillMdPath = join(dir, entry.name, "SKILL.md");

      if (existsSync(skillJsonPath)) {
        try {
          const data = JSON.parse(readFileSync(skillJsonPath, "utf-8"));
          skills.push({
            name: data.name || entry.name,
            displayName: data.displayName,
            version: data.version,
            description: data.description,
            installedFrom: data.installedFrom,
          });
        } catch {
          skills.push({ name: entry.name });
        }
      } else if (existsSync(skillMdPath)) {
        // Has SKILL.md but no skill.json — still a skill
        skills.push({ name: entry.name });
      }
    }
  } catch {
    // Dir not readable
  }

  return skills;
}
