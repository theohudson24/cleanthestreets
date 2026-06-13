'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NavigationBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user ?? null);
      } catch (error) {
        setUser(null);
      }
    };

    fetchSession();
  }, [pathname]);

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
    <nav className="sticky top-0 z-40 bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center rounded-xl px-2 py-1.5 text-green-800 transition hover:bg-green-50"
            >
              <span className="flex flex-col leading-none">
                <span className="text-lg font-semibold tracking-tight text-green-800 sm:text-xl">
                  CleanTheStreets
                </span>
                <span className="mt-1 pl-[1px] text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-green-700/70 sm:text-[0.55rem]">
                  Report. Repair. Improve.
                </span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-white bg-green-700'
                    : 'text-gray-700 hover:text-green-800 hover:bg-green-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signin"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 rounded-full border border-green-200 hover:bg-green-50 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-green-800 hover:text-green-900"
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
                    ? 'text-white bg-green-700'
                    : 'text-gray-700 bg-white border border-green-100 hover:bg-green-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-full text-base font-semibold text-green-700 bg-white border border-green-100 hover:bg-green-50 transition"
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
