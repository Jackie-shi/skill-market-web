#!/usr/bin/env node

import { Command } from "commander";
import { installCommand } from "./commands/install.js";
import { searchCommand } from "./commands/search.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("skillmarket")
  .description("Discover, install, and manage AI Skills from Skill Market")
  .version("1.0.0");

program
  .command("install <skill-name>")
  .description("Install a skill from Skill Market")
  .option("-p, --platform <platform>", "Target platform (openclaw, claude-code, cursor, windsurf)")
  .option("-d, --dir <directory>", "Custom install directory")
  .action(installCommand);

program
  .command("search <query>")
  .description("Search for skills on Skill Market")
  .option("-c, --category <category>", "Filter by category")
  .option("-l, --limit <number>", "Max results to show", "20")
  .action(searchCommand);

program
  .command("list")
  .description("List locally installed skills")
  .option("-d, --dir <directory>", "Custom skill directory to scan")
  .action(listCommand);

program
  .command("info <skill-name>")
  .description("Show detailed info about a skill")
  .action(async (skillName: string) => {
    const chalk = (await import("chalk")).default;
    const ora = (await import("ora")).default;
    const { getSkillDetail } = await import("./api.js");

    const spinner = ora("Fetching...").start();
    try {
      const skill = await getSkillDetail(skillName);
      spinner.stop();

      console.log(chalk.bold(skill.displayName) + chalk.dim(` v${skill.version}`));
      console.log();
      console.log(skill.description);
      console.log();
      console.log(chalk.dim("Name:      "), skill.name);
      console.log(chalk.dim("Category:  "), skill.category);
      console.log(chalk.dim("Downloads: "), skill.downloads);
      console.log(chalk.dim("Pricing:   "), skill.pricingModel === "free" ? chalk.green("Free") : `$${skill.price}`);
      if (skill.author) console.log(chalk.dim("Author:    "), skill.author.name);

      const platforms = skill.platforms ? JSON.parse(skill.platforms) : [];
      if (platforms.length) console.log(chalk.dim("Platforms: "), platforms.join(", "));

      if (skill.keywords) {
        const kw = JSON.parse(skill.keywords);
        if (kw.length) console.log(chalk.dim("Keywords:  "), kw.join(", "));
      }

      console.log();
      console.log(chalk.cyan("Install:"), `npx skillmarket install ${skill.name}`);
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse();
