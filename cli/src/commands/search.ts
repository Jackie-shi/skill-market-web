import chalk from "chalk";
import ora from "ora";
import { searchSkills } from "../api.js";

/**
 * Search for skills on Skill Market
 */
export async function searchCommand(
  query: string,
  options: { category?: string; limit?: string }
) {
  const spinner = ora("Searching...").start();

  try {
    const result = await searchSkills(query, options.category);
    const skills = result.skills;
    const limit = options.limit ? parseInt(options.limit) : 20;

    spinner.stop();

    if (skills.length === 0) {
      console.log(chalk.yellow(`No skills found for "${query}"`));
      console.log(chalk.dim("Try a broader search term or browse categories."));
      return;
    }

    const shown = skills.slice(0, limit);

    console.log(
      chalk.bold(`Found ${skills.length} skill${skills.length !== 1 ? "s" : ""}`) +
        (skills.length > limit ? chalk.dim(` (showing ${limit})`) : "")
    );
    console.log();

    for (const skill of shown) {
      const pricing =
        skill.pricingModel === "free"
          ? chalk.green("FREE")
          : chalk.yellow(`$${skill.price}`);
      const platforms = skill.platforms ? JSON.parse(skill.platforms) : [];

      console.log(
        `  ${chalk.bold(skill.displayName)} ${chalk.dim(`v${skill.version}`)} ${pricing}`
      );
      console.log(`  ${chalk.dim(skill.name)} · ${skill.category} · ↓${skill.downloads}`);
      console.log(`  ${chalk.dim(skill.description)}`);
      if (platforms.length > 0) {
        console.log(`  ${chalk.dim("Platforms:")} ${platforms.join(", ")}`);
      }
      console.log();
    }

    console.log(
      chalk.dim(`Install: npx skillmarket install <name>`)
    );
  } catch (err: any) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
