"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg shrink-0">
          🛒 <span className="hidden sm:inline">Skill Market</span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-6" role="search">
          <div className="relative w-full">
            <label htmlFor="desktop-search" className="sr-only">Search skills</label>
            <input
              id="desktop-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills..."
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <nav className="hidden sm:flex items-center gap-4">
          <Link href="/search" className="text-sm text-gray-400 hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/publish" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
            Publish Skill
          </Link>

          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-700 p-0.5 hover:border-gray-500 transition-colors"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-medium">
                    {(session.user.name || "U")[0].toUpperCase()}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile/purchases"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Purchases
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 border-t border-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 text-gray-400" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden border-t border-gray-800 bg-gray-950 px-4 pb-4 pt-2 space-y-2" aria-label="Mobile navigation">
          <form onSubmit={handleSearch}>
            <label htmlFor="mobile-search" className="sr-only">Search skills</label>
            <input
              id="mobile-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills..."
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </form>
          <Link href="/search" className="block py-3 text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Browse All</Link>
          <Link href="/publish" className="block rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white text-center" onClick={() => setMobileOpen(false)}>Publish Skill</Link>
          {session ? (
            <>
              <Link href="/profile" className="block py-3 text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>My Profile</Link>
              <Link href="/dashboard" className="block py-3 text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/profile/purchases" className="block py-3 text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Purchases</Link>
              <button onClick={() => signOut()} className="block py-3 text-sm text-red-400 hover:text-red-300">Sign Out</button>
            </>
          ) : (
            <button onClick={() => signIn("github")} className="flex items-center gap-2 py-3 text-sm text-gray-400 hover:text-white">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign In with GitHub
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
