import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import BlogContent from "./BlogContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skillmarket.dev";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return { title: "Post Not Found" };
  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function ArticleJsonLd({ post }: { post: NonNullable<ReturnType<typeof getPost>> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Skill Market",
      url: BASE_URL,
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd post={post} />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/blog" className="hover:text-emerald-400 transition-colors">
            ← Back to Blog
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize">
              {post.category}
            </span>
            <span className="text-xs text-gray-500">{post.readingTime} min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-lg text-gray-400 mb-4">{post.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </time>
          </div>
        </header>

        {/* Content */}
        <BlogContent content={post.content} />

        {/* Related Skills CTA */}
        {post.relatedSkills.length > 0 && (
          <aside className="mt-12 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🔗 Related Skills on Skill Market</h3>
            <div className="flex flex-wrap gap-2">
              {post.relatedSkills.map((skill) => (
                <Link
                  key={skill}
                  href={`/skills/${skill}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                >
                  {skill}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center rounded-xl border border-gray-800 bg-gray-900/50 p-8">
          <h3 className="text-xl font-bold text-white mb-2">Ready to supercharge your AI workflow?</h3>
          <p className="text-gray-400 mb-4">Browse hundreds of community-built skills for your favorite AI tools.</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Browse Skills →
          </Link>
        </div>
      </article>
    </>
  );
}
