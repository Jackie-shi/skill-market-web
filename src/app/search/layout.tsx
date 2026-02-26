import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

export const metadata: Metadata = {
  title: "Browse AI Skills",
  description: "Search and discover AI skills for Claude Code, OpenClaw, Cursor, and more. Filter by category, rating, and platform.",
  alternates: { canonical: `${BASE_URL}/search` },
  openGraph: {
    title: "Browse AI Skills — Skill Market",
    description: "Search and discover AI skills for Claude Code, OpenClaw, Cursor, and more.",
    url: `${BASE_URL}/search`,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
