#!/usr/bin/env node
import {
  detectPlatforms,
  getDownloadInfo,
  getInstallDir,
  getSkillDetail,
  searchSkills
} from "./chunk-G4S4VBE6.js";

// src/index.ts
import { Command } from "commander";

// src/commands/install.ts
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import ora from "ora";
async function installCommand(skillName, options) {
  const spinner = ora(`Fetching skill "${skillName}"...`).start();
  try {
    const skill = await getSkillDetail(skillName);
    spinner.text = `Found ${chalk.bold(skill.displayName)} v${skill.version}`;
    const download = await getDownloadInfo(skillName);
    const installDir = options.dir || getInstallDir(options.platform);
    const skillDir = join(installDir, skillName);
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
          spinner.text = `Updating ${skill.displayName} ${existing.version} \u2192 ${skill.version}`;
        } catch {
        }
      }
    }
    spinner.text = `Installing to ${skillDir}...`;
    mkdirSync(skillDir, { recursive: true });
    const skillJson = {
      name: skill.name,
      version: skill.version,
      displayName: skill.displayName,
      description: skill.description,
      category: skill.category,
      platforms: skill.platforms ? JSON.parse(skill.platforms) : [],
      installedAt: (/* @__PURE__ */ new Date()).toISOString(),
      installedFrom: "skillmarket"
    };
    writeFileSync(join(skillDir, "skill.json"), JSON.stringify(skillJson, null, 2));
    const skillMdContent = generateSkillMd(skill);
    writeFileSync(join(skillDir, "SKILL.md"), skillMdContent);
    const readmeContent = generateReadme(skill);
    writeFileSync(join(skillDir, "README.md"), readmeContent);
    spinner.succeed(
      `${chalk.green("\u2713")} Installed ${chalk.bold(skill.displayName)} v${skill.version}`
    );
    console.log();
    console.log(chalk.dim("  Location:"), skillDir);
    console.log(chalk.dim("  Category:"), skill.category);
    if (skill.author) {
      console.log(chalk.dim("  Author:  "), skill.author.name);
    }
    const detectedPlatforms = detectPlatforms().filter((p) => p.detected);
    if (detectedPlatforms.length > 0) {
      console.log();
      console.log(chalk.cyan("  Detected platforms:"));
      for (const p of detectedPlatforms) {
        const isTarget = skillDir.startsWith(p.skillDir) || installDir === p.skillDir;
        console.log(
          `    ${isTarget ? chalk.green("\u25CF") : chalk.dim("\u25CB")} ${p.name}${isTarget ? chalk.green(" (installed here)") : ""}`
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
  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
function generateSkillMd(skill) {
  let md = `# ${skill.displayName}

`;
  md += `${skill.description}

`;
  if (skill.longDescription) {
    md += skill.longDescription + "\n";
  }
  return md;
}
function generateReadme(skill) {
  let md = `# ${skill.displayName}

`;
  md += `> ${skill.description}

`;
  md += `- **Version:** ${skill.version}
`;
  md += `- **Category:** ${skill.category}
`;
  if (skill.author) md += `- **Author:** ${skill.author.name}
`;
  md += `- **Downloads:** ${skill.downloads}
`;
  md += `
## Installation

`;
  md += "```bash\nnpx skillmarket install " + skill.name + "\n```\n";
  if (skill.longDescription) {
    md += `
## About

${skill.longDescription}
`;
  }
  return md;
}

// src/commands/search.ts
import chalk2 from "chalk";
import ora2 from "ora";
async function searchCommand(query, options) {
  const spinner = ora2("Searching...").start();
  try {
    const result = await searchSkills(query, options.category);
    const skills = result.skills;
    const limit = options.limit ? parseInt(options.limit) : 20;
    spinner.stop();
    if (skills.length === 0) {
      console.log(chalk2.yellow(`No skills found for "${query}"`));
      console.log(chalk2.dim("Try a broader search term or browse categories."));
      return;
    }
    const shown = skills.slice(0, limit);
    console.log(
      chalk2.bold(`Found ${skills.length} skill${skills.length !== 1 ? "s" : ""}`) + (skills.length > limit ? chalk2.dim(` (showing ${limit})`) : "")
    );
    console.log();
    for (const skill of shown) {
      const pricing = skill.pricingModel === "free" ? chalk2.green("FREE") : chalk2.yellow(`$${skill.price}`);
      const platforms = skill.platforms ? JSON.parse(skill.platforms) : [];
      console.log(
        `  ${chalk2.bold(skill.displayName)} ${chalk2.dim(`v${skill.version}`)} ${pricing}`
      );
      console.log(`  ${chalk2.dim(skill.name)} \xB7 ${skill.category} \xB7 \u2193${skill.downloads}`);
      console.log(`  ${chalk2.dim(skill.description)}`);
      if (platforms.length > 0) {
        console.log(`  ${chalk2.dim("Platforms:")} ${platforms.join(", ")}`);
      }
      console.log();
    }
    console.log(
      chalk2.dim(`Install: npx skillmarket install <name>`)
    );
  } catch (err) {
    spinner.fail(chalk2.red(err.message));
    process.exit(1);
  }
}

// src/commands/list.ts
import { readdirSync, readFileSync as readFileSync2, existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";
import chalk3 from "chalk";
async function listCommand(options) {
  const platforms = detectPlatforms();
  const dirsToScan = [];
  if (options.dir) {
    dirsToScan.push({ name: "Custom", dir: options.dir });
  } else {
    for (const p of platforms) {
      if (existsSync2(p.skillDir)) {
        dirsToScan.push({ name: p.name, dir: p.skillDir });
      }
    }
    const fallback = join2(process.env.HOME || "", ".skills");
    if (existsSync2(fallback) && !dirsToScan.some((d) => d.dir === fallback)) {
      dirsToScan.push({ name: "Default", dir: fallback });
    }
  }
  if (dirsToScan.length === 0) {
    console.log(chalk3.yellow("No skill directories found."));
    console.log(chalk3.dim("Install a skill first: npx skillmarket install <name>"));
    return;
  }
  let totalSkills = 0;
  for (const { name, dir } of dirsToScan) {
    const skills = scanSkillDir(dir);
    if (skills.length === 0) continue;
    totalSkills += skills.length;
    console.log(chalk3.bold.cyan(`${name}`) + chalk3.dim(` (${dir})`));
    console.log();
    for (const skill of skills) {
      const version = skill.version ? chalk3.dim(`v${skill.version}`) : "";
      const source = skill.installedFrom ? chalk3.dim(`from ${skill.installedFrom}`) : "";
      console.log(
        `  ${chalk3.bold(skill.displayName || skill.name)} ${version} ${source}`
      );
      if (skill.description) {
        console.log(`  ${chalk3.dim(skill.description)}`);
      }
      console.log();
    }
  }
  if (totalSkills === 0) {
    console.log(chalk3.yellow("No skills installed."));
    console.log(chalk3.dim("Install one: npx skillmarket install <name>"));
  } else {
    console.log(chalk3.dim(`Total: ${totalSkills} skill${totalSkills !== 1 ? "s" : ""}`));
  }
}
function scanSkillDir(dir) {
  const skills = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillJsonPath = join2(dir, entry.name, "skill.json");
      const skillMdPath = join2(dir, entry.name, "SKILL.md");
      if (existsSync2(skillJsonPath)) {
        try {
          const data = JSON.parse(readFileSync2(skillJsonPath, "utf-8"));
          skills.push({
            name: data.name || entry.name,
            displayName: data.displayName,
            version: data.version,
            description: data.description,
            installedFrom: data.installedFrom
          });
        } catch {
          skills.push({ name: entry.name });
        }
      } else if (existsSync2(skillMdPath)) {
        skills.push({ name: entry.name });
      }
    }
  } catch {
  }
  return skills;
}

// src/index.ts
var program = new Command();
program.name("skillmarket").description("Discover, install, and manage AI Skills from Skill Market").version("1.0.0");
program.command("install <skill-name>").description("Install a skill from Skill Market").option("-p, --platform <platform>", "Target platform (openclaw, claude-code, cursor, windsurf)").option("-d, --dir <directory>", "Custom install directory").action(installCommand);
program.command("search <query>").description("Search for skills on Skill Market").option("-c, --category <category>", "Filter by category").option("-l, --limit <number>", "Max results to show", "20").action(searchCommand);
program.command("list").description("List locally installed skills").option("-d, --dir <directory>", "Custom skill directory to scan").action(listCommand);
program.command("info <skill-name>").description("Show detailed info about a skill").action(async (skillName) => {
  const chalk4 = (await import("chalk")).default;
  const ora3 = (await import("ora")).default;
  const { getSkillDetail: getSkillDetail2 } = await import("./api-2TX5DEWV.js");
  const spinner = ora3("Fetching...").start();
  try {
    const skill = await getSkillDetail2(skillName);
    spinner.stop();
    console.log(chalk4.bold(skill.displayName) + chalk4.dim(` v${skill.version}`));
    console.log();
    console.log(skill.description);
    console.log();
    console.log(chalk4.dim("Name:      "), skill.name);
    console.log(chalk4.dim("Category:  "), skill.category);
    console.log(chalk4.dim("Downloads: "), skill.downloads);
    console.log(chalk4.dim("Pricing:   "), skill.pricingModel === "free" ? chalk4.green("Free") : `$${skill.price}`);
    if (skill.author) console.log(chalk4.dim("Author:    "), skill.author.name);
    const platforms = skill.platforms ? JSON.parse(skill.platforms) : [];
    if (platforms.length) console.log(chalk4.dim("Platforms: "), platforms.join(", "));
    if (skill.keywords) {
      const kw = JSON.parse(skill.keywords);
      if (kw.length) console.log(chalk4.dim("Keywords:  "), kw.join(", "));
    }
    console.log();
    console.log(chalk4.cyan("Install:"), `npx skillmarket install ${skill.name}`);
  } catch (err) {
    spinner.fail(chalk4.red(err.message));
    process.exit(1);
  }
});
program.parse();
