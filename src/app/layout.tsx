import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Skill Market — AI Skills Marketplace",
    template: "%s | Skill Market",
  },
  description: "Discover, share and trade AI Skills for Claude Code, OpenClaw, Cursor and beyond. Extend your AI tools in seconds.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Skill Market — AI Skills Marketplace",
    description: "Discover, share and trade AI Skills for Claude Code, OpenClaw, Cursor and beyond.",
    type: "website",
    siteName: "Skill Market",
    locale: "en_US",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Market — AI Skills Marketplace",
    description: "Discover, share and trade AI Skills for Claude Code, OpenClaw, Cursor and beyond.",
  },
  keywords: ["AI skills", "Claude Code", "OpenClaw", "Cursor", "AI marketplace", "skill marketplace", "AI tools", "developer tools"],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-white min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
