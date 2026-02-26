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

  // Try multiple possible locations for seeds directory
  const candidates = [
    path.resolve(__dirname, "../../../../content/seeds"),
    path.resolve(__dirname, "../../../content/seeds"),
    path.resolve(__dirname, "../../content/seeds"),
    path.resolve(__dirname, "../../../../../content/seeds"),
  ];
  const seedsDir = candidates.find((d) => fs.existsSync(d)) || candidates[0];

  if (!fs.existsSync(seedsDir)) {
    console.log("Seeds directory not found at", seedsDir);
    return;
  }

  const seedFolders = fs.readdirSync(seedsDir).filter((f) =>
    fs.statSync(path.join(seedsDir, f)).isDirectory()
  );

  let count = 0;
  for (const folder of seedFolders) {
    const skillJsonPath = path.join(seedsDir, folder, "skill.json");
    if (!fs.existsSync(skillJsonPath)) continue;

    const skill = JSON.parse(fs.readFileSync(skillJsonPath, "utf-8"));

    await prisma.publishedSkill.upsert({
      where: { name: skill.name },
      update: {
        displayName: skill.displayName,
        description: skill.description,
        longDescription: skill.longDescription || null,
        version: skill.version,
        category: skill.category,
        price: skill.pricing?.model === "free" ? 0 : (skill.pricing?.price || 0),
        pricingModel: skill.pricing?.model || "free",
        platforms: JSON.stringify(skill.compatibility?.platforms || []),
        keywords: JSON.stringify(skill.keywords || []),
        license: skill.license || "MIT",
      },
      create: {
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
        longDescription: skill.longDescription || null,
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
    count++;
    console.log(`  ✓ ${skill.displayName}`);
  }

  console.log(`\nSeeded ${count} skills from ${seedsDir}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
