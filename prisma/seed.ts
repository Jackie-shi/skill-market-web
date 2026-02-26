import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // Create a system user for seed skills
  const systemUser = await prisma.user.upsert({
    where: { email: "team@skillmarket.dev" },
    update: {},
    create: {
      id: "system-seed-user",
      name: "Skill Market Team",
      email: "team@skillmarket.dev",
    },
  });

  const seedsDir = path.resolve(__dirname, "../../../../content/seeds");
  
  // Fallback if seeds dir not found (e.g. in production)
  if (!fs.existsSync(seedsDir)) {
    console.log("Seeds directory not found, using inline seeds");
    await seedInline(systemUser.id);
    return;
  }

  const seedFolders = fs.readdirSync(seedsDir).filter((f) =>
    fs.statSync(path.join(seedsDir, f)).isDirectory()
  );

  for (const folder of seedFolders) {
    const skillJsonPath = path.join(seedsDir, folder, "skill.json");
    if (!fs.existsSync(skillJsonPath)) continue;

    const skill = JSON.parse(fs.readFileSync(skillJsonPath, "utf-8"));

    await prisma.publishedSkill.upsert({
      where: { name: skill.name },
      update: {},
      create: {
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
        version: skill.version,
        category: skill.category,
        price: skill.pricing?.model === "free" ? 0 : (skill.pricing?.price || 0),
        pricingModel: skill.pricing?.model || "free",
        platforms: JSON.stringify(skill.compatibility?.platforms || []),
        keywords: JSON.stringify(skill.keywords || []),
        license: skill.license || "MIT",
        status: "approved",
        authorId: systemUser.id,
      },
    });
    console.log(`  ✓ ${skill.displayName}`);
  }

  console.log(`Seeded ${seedFolders.length} skills`);
}

async function seedInline(authorId: string) {
  const skills = [
    { name: "readme-generator", displayName: "README Generator", description: "Generate comprehensive README.md files by analyzing project structure", category: "content", keywords: ["readme","documentation","markdown"] },
    { name: "test-generator", displayName: "Test Generator", description: "Auto-generate unit and integration tests for your codebase", category: "development", keywords: ["testing","unit-test","jest"] },
    { name: "pr-review-assistant", displayName: "PR Review Assistant", description: "Automated pull request review with actionable feedback", category: "development", keywords: ["code-review","pull-request","github"] },
    { name: "docker-compose-generator", displayName: "Docker Compose Generator", description: "Generate docker-compose.yml from project analysis", category: "devops", keywords: ["docker","containers","deployment"] },
    { name: "csv-analyzer", displayName: "CSV Analyzer", description: "Analyze CSV files with statistical summaries and visualizations", category: "data", keywords: ["csv","data-analysis","statistics"] },
    { name: "changelog-generator", displayName: "Changelog Generator", description: "Generate changelogs from git history and conventional commits", category: "content", keywords: ["changelog","git","release-notes"] },
    { name: "env-manager", displayName: "Environment Manager", description: "Manage .env files across environments with validation", category: "devops", keywords: ["env","configuration","secrets"] },
    { name: "db-migration-helper", displayName: "DB Migration Helper", description: "Generate and manage database migrations from schema changes", category: "development", keywords: ["database","migration","schema"] },
    { name: "ssh-deploy-helper", displayName: "SSH Deploy Helper", description: "Automate SSH-based deployments with rollback support", category: "devops", keywords: ["ssh","deployment","automation"] },
    { name: "cron-job-helper", displayName: "Cron Job Helper", description: "Create, test and manage cron expressions and scheduled tasks", category: "devops", keywords: ["cron","scheduling","automation"] },
  ];

  for (const s of skills) {
    await prisma.publishedSkill.upsert({
      where: { name: s.name },
      update: {},
      create: {
        ...s,
        version: "1.0.0",
        price: 0,
        pricingModel: "free",
        platforms: JSON.stringify(["openclaw", "claude-code", "cursor"]),
        keywords: JSON.stringify(s.keywords),
        license: "MIT",
        status: "approved",
        authorId,
      },
    });
    console.log(`  ✓ ${s.displayName}`);
  }
  console.log("Seeded 10 skills (inline)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
