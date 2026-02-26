import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import ora from "ora";
import { getSkillDetail, getDownloadInfo } from "../api.js";
import { detectPlatforms, getInstallDir } from "../config.js";

/**
 * Install a skill from Skill Market
 */
export async function installCommand(
  skillName: string,
  options: { platform?: string; dir?: string }
) {
  const spinner = ora(`Fetching skill "${skillName}"...`).start();

  try {
    // 1. Get skill detail from API
    const skill = await getSkillDetail(skillName);
    spinner.text = `Found ${chalk.bold(skill.displayName)} v${skill.version}`;

    // 2. Get download info (increments download counter)
    const download = await getDownloadInfo(skillName);

    // 3. Determine install directory
    const installDir = options.dir || getInstallDir(options.platform);
    const skillDir = join(installDir, skillName);

    // Check if already installed
    if (existsSync(skillDir)) {
      const existingJson = join(skillDir, "skill.json");
      if (existsSync(existingJson)) {
        try {
          const existing = JSON.parse(readFileSync(existingJson, "utf-8"));
          if (existing.version === skill.version) {
            spinner.info(
              `${chalk.bold(skill.displayName)} v${skill.version} is already installed`
            );
            console.log(chalk.dim(`  Location: ${skillDir}`));
            return;
          }
          spinner.text = `Updating ${skill.displayName} ${existing.version} → ${skill.version}`;
        } catch {
          // Corrupted skill.json, reinstall
        }
      }
    }

    // 4. Create skill directory and write files
    spinner.text = `Installing to ${skillDir}...`;
    mkdirSync(skillDir, { recursive: true });

    // Generate skill.json
    const skillJson = {
      name: skill.name,
      version: skill.version,
      displayName: skill.displayName,
      description: skill.description,
      category: skill.category,
      platforms: skill.platforms ? JSON.parse(skill.platforms) : [],
      installedAt: new Date().toISOString(),
      installedFrom: "skillmarket",
    };
    writeFileSync(join(skillDir, "skill.json"), JSON.stringify(skillJson, null, 2));

    // Generate SKILL.md from longDescription or description
    const skillMdContent = generateSkillMd(skill);
    writeFileSync(join(skillDir, "SKILL.md"), skillMdContent);

    // Generate README.md
    const readmeContent = generateReadme(skill);
    writeFileSync(join(skillDir, "README.md"), readmeContent);

    // 5. Detect platforms and show results
    spinner.succeed(
      `${chalk.green("✓")} Installed ${chalk.bold(skill.displayName)} v${skill.version}`
    );

    console.log();
    console.log(chalk.dim("  Location:"), skillDir);
    console.log(chalk.dim("  Category:"), skill.category);
    if (skill.author) {
      console.log(chalk.dim("  Author:  "), skill.author.name);
    }

    // Show platform-specific info
    const detectedPlatforms = detectPlatforms().filter((p) => p.detected);
    if (detectedPlatforms.length > 0) {
      console.log();
      console.log(chalk.cyan("  Detected platforms:"));
      for (const p of detectedPlatforms) {
        const isTarget = skillDir.startsWith(p.skillDir) || installDir === p.skillDir;
        console.log(
          `    ${isTarget ? chalk.green("●") : chalk.dim("○")} ${p.name}${isTarget ? chalk.green(" (installed here)") : ""}`
        );
      }
    }

    console.log();
    console.log(chalk.cyan("  Usage:"));
    console.log(
      chalk.dim("    The skill is ready to use. Your AI tool will automatically detect it.")
    );
    console.log(
      chalk.dim(`    Reference it by mentioning "${skill.displayName}" in your prompts.`)
    );
  } catch (err: any) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

function generateSkillMd(skill: SkillDetail): string {
  let md = `# ${skill.displayName}\n\n`;
  md += `${skill.description}\n\n`;

  if (skill.longDescription) {
    md += skill.longDescription + "\n";
  }

  return md;
}

function generateReadme(skill: SkillDetail): string {
  let md = `# ${skill.displayName}\n\n`;
  md += `> ${skill.description}\n\n`;
  md += `- **Version:** ${skill.version}\n`;
  md += `- **Category:** ${skill.category}\n`;
  if (skill.author) md += `- **Author:** ${skill.author.name}\n`;
  md += `- **Downloads:** ${skill.downloads}\n`;
  md += `\n## Installation\n\n`;
  md += "```bash\nnpx skillmarket install " + skill.name + "\n```\n";

  if (skill.longDescription) {
    md += `\n## About\n\n${skill.longDescription}\n`;
  }

  return md;
}

interface SkillDetail {
  name: string;
  displayName: string;
  description: string;
  longDescription: string | null;
  category: string;
  version: string;
  downloads: number;
  platforms: string;
  author: { name: string; image: string | null } | null;
}
