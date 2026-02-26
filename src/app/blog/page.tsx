import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, BlogPost } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

export const metadata: Metadata = {
  title: "Blog — AI Skills Tutorials, Comparisons & Guides",
  description:
    "Learn how to write Cursor rules, build Claude Code skills, set up Windsurf, and more. Tutorials, comparisons, and curated lists for the AI tools ecosystem.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: "Blog — Skill Market",
    description: "Tutorials, comparisons and curated lists for AI tool skills.",
    url: `${BASE_URL}/blog`,
    type: "website",
  },
};

const categoryLabels: Record<string, { label: string; color: string }> = {
  tutorial: { label: "Tutorial", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  comparison: { label: "Comparison", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  listicle: { label: "Top List", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

function PostCard({ post }: { post: BlogPost }) {
  const cat = categoryLabels[post.category] || categoryLabels.tutorial;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-emerald-500/50 hover:bg-gray-900 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cat.color}`}>
          {cat.label}
        </span>
        <span className="text-xs text-gray-500">{post.readingTime} min read</span>
      </div>
      <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
        {post.title}
      </h2>
      <p className="text-sm text-gray-400 line-clamp-2 mb-4">{post.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{post.author}</span>
        <span>·</span>
        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const tutorials = posts.filter((p) => p.category === "tutorial");
  const comparisons = posts.filter((p) => p.category === "comparison");
  const listicles = posts.filter((p) => p.category === "listicle");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Tutorials, comparisons, and curated lists to help you get the most out of AI coding tools.
        </p>
      </header>

      {/* All posts grid */}
      <section className="mb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-20">No posts yet. Check back soon!</p>
      )}
    </div>
  );
}
