export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SkillDetailClient from "./SkillDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

interface Props {
  params: { slug: string };
}

async function getSkill(slug: string) {
  return prisma.publishedSkill.findFirst({
    where: { name: slug, status: "approved" },
    include: {
      author: { select: { name: true, image: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const skill = await getSkill(params.slug);
  if (!skill) return { title: "Skill Not Found — Skill Market" };

  const title = `${skill.displayName} — Skill Market`;
  const description = skill.description.slice(0, 160);
  const url = `${BASE_URL}/skills/${skill.name}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Skill Market",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SkillPage({ params }: Props) {
  const skill = await getSkill(params.slug);

  // JSON-LD structured data
  const jsonLd = skill
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: skill.displayName,
        description: skill.description,
        url: `${BASE_URL}/skills/${skill.name}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: skill.osTargets
          ? JSON.parse(skill.osTargets).join(", ")
          : "Any",
        author: {
          "@type": "Person",
          name: skill.author?.name ?? "Unknown",
        },
        offers: {
          "@type": "Offer",
          price: skill.price,
          priceCurrency: skill.currency,
          availability: "https://schema.org/InStock",
        },
        softwareVersion: skill.version,
        ...(skill.averageRating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: skill.averageRating,
            reviewCount: skill.reviewCount,
          },
        }),
        downloadUrl: `${BASE_URL}/api/skills/${skill.name}/download`,
        datePublished: skill.createdAt.toISOString(),
        dateModified: skill.updatedAt.toISOString(),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SkillDetailClient slug={params.slug} />
    </>
  );
}
