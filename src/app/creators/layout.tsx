import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

export const metadata: Metadata = {
  title: "Become a Creator",
  description: "Join Skill Market's Early Creator Program. Publish AI skills, earn money, and shape the AI tools ecosystem.",
  alternates: { canonical: `${BASE_URL}/creators` },
  openGraph: {
    title: "Become a Creator — Skill Market",
    description: "Publish AI skills, earn money, and shape the AI tools ecosystem.",
    url: `${BASE_URL}/creators`,
  },
};

export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
