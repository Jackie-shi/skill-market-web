"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function BlogContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-emerald max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
      prose-code:text-emerald-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl
      prose-li:text-gray-300
      prose-strong:text-white
      prose-blockquote:border-emerald-500/50 prose-blockquote:text-gray-400
      prose-img:rounded-xl
      prose-table:text-sm
      prose-th:text-gray-300 prose-td:text-gray-400
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.startsWith("/")) {
              return <Link href={href} {...props}>{children}</Link>;
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
