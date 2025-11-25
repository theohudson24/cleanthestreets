'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for signed-in user in localStorage
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    // Check on mount
    checkUser();

    // Listen for storage changes (when user signs in/out in another tab)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkUser);
      return () => window.removeEventListener('storage', checkUser);
    }
  }, [pathname]); // Re-check when pathname changes (e.g., after sign in)

  const isActive = (path) => pathname === path || pathname?.startsWith(path + '/');

  // Base nav links (always visible)
  const baseNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/map', label: 'Map' },
    { href: '/report', label: 'Report' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  // Conditional nav links
  const navLinks = user
    ? [...baseNavLinks, { href: '/profile', label: 'Profile' }]
    : baseNavLinks;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg sm:text-xl font-semibold text-white tracking-tight"
            >
              CleanTheStreets
            </Link>
            <span className="hidden sm:inline-flex rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-indigo-100 border border-white/10">
              Live beta
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow-[0_10px_25px_rgba(37,99,235,0.35)]'
                    : 'text-slate-200 hover:text-white hover:bg-white/5 hover:shadow-[0_10px_25px_rgba(59,130,246,0.25)]'
                }`}
              >
                {link.label}
                {!isActive(link.href) && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/0 via-blue-500/0 to-cyan-400/0 opacity-0 blur-md transition hover:opacity-50" />
                )}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signin"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-200 rounded-full border border-white/10 hover:text-white hover:border-blue-400/50 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-200 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-full text-base font-semibold transition ${
                  isActive(link.href)
                    ? 'text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow-[0_12px_30px_rgba(37,99,235,0.35)]'
                    : 'text-slate-200 bg-white/5 border border-white/5 hover:border-blue-400/40'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-full text-base font-semibold text-slate-200 bg-white/5 border border-white/5 hover:border-blue-400/40 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
