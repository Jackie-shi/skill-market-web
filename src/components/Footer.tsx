import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 Skill Market. Open ecosystem for AI skills.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/search" className="hover:text-gray-300 transition-colors">Browse</Link>
            <Link href="/publish" className="hover:text-gray-300 transition-colors">Publish</Link>
            <a href="https://docs.openclaw.ai" target="_blank" rel="noopener" className="hover:text-gray-300 transition-colors">Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
