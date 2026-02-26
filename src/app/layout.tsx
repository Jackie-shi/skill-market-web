import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Market — AI Skills Marketplace",
  description:
    "Discover, share and trade AI Skills for Claude Code, OpenClaw and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
