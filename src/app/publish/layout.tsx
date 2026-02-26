import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

export const metadata: Metadata = {
  title: "Publish a Skill",
  description: "Submit your AI skill to Skill Market. Free to publish, reach thousands of developers using Claude Code, OpenClaw, and Cursor.",
  alternates: { canonical: `${BASE_URL}/publish` },
};

export default function PublishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
