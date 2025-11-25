'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: null, fixed: null, recent: null });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const reports = await response.json();
        const total = reports.length;
        const fixed = reports.filter((r) => r.status === 'fixed').length;
        const recent = reports.filter((r) => {
          const date = new Date(r.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length;
        setStats({ total, fixed, recent });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/map?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/map');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      {/* main content sits under your existing global navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main layout: hero + stats card */}
        <main className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
          {/* Left: Hero + search + primary actions */}
          <section>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
              Make your streets
              <span className="block text-blue-700">safer and smoother.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mb-6">
              Report potholes and road hazards in seconds. Track fixes over time and
              climb the community leaderboard as a neighborhood hero.
            </p>

            {/* Primary actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Report an issue
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-medium text-slate-900 hover:bg-white transition-colors"
              >
                Open map
              </Link>
            </div>

            {/* Search bar */}
            <div className="max-w-xl">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an address or place…"
                  className="flex-1 border-none bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 hover:bg-slate-800 transition-colors"
                >
                  Search
                </button>
              </form>
              <p className="mt-2 text-xs text-slate-500">
                Try a street name, intersection, or neighborhood.
              </p>
            </div>
          </section>

          {/* Right: Stats card */}
          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">This week at a glance</h2>
                  <p className="text-xs text-slate-500">
                    Live stats from community reports.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                  Updated in real time
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="text-[11px] font-medium text-slate-500 mb-2">
                    Total reports
                  </div>
                  <div className="text-2xl font-semibold text-slate-900 leading-tight">
                    {loading ? (
                      <LoadingSpinner size="sm" className="mx-auto" />
                    ) : (
                      stats.total ?? '—'
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="text-[11px] font-medium text-slate-500 mb-2">
                    Fixed issues
                  </div>
                  <div className="text-2xl font-semibold text-emerald-600 leading-tight">
                    {loading ? (
                      <LoadingSpinner size="sm" className="mx-auto" />
                    ) : (
                      stats.fixed ?? '—'
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="text-[11px] font-medium text-slate-500 mb-2">
                    New (last 7 days)
                  </div>
                  <div className="text-2xl font-semibold text-amber-500 leading-tight">
                    {loading ? (
                      <LoadingSpinner size="sm" className="mx-auto" />
                    ) : (
                      stats.recent ?? '—'
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs text-slate-600 mb-1">
                  Want to see where these reports are coming from?
                </p>
                <Link
                  href="/leaderboard"
                  className="text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  View community leaderboard →
                </Link>
              </div>
            </div>
          </aside>
        </main>

        {/* How it works – more stylized / Linear-like */}
        <section className="mt-16">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  How it works
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Three simple steps to make your neighborhood safer.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                Built for quick, repeat reporting
              </span>
            </div>

            <div className="relative mt-4">
              {/* connector line (desktop) */}
              <div className="hidden sm:block absolute left-[12%] right-[12%] top-6 h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10" />

              <div className="grid gap-8 sm:grid-cols-3">
                {/* Step 1 */}
                <div className="relative flex flex-col gap-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-blue-600 to-blue-500 text-[13px] font-semibold text-white shadow-sm">
                    1
                  </div>
                  <h3 className="mt-1 text-sm font-medium text-slate-900">
                    Report an issue
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Snap a photo, drop a pin on the map, and submit a quick report with
                    location and severity.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col gap-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-blue-500 to-sky-500 text-[13px] font-semibold text-white shadow-sm">
                    2
                  </div>
                  <h3 className="mt-1 text-sm font-medium text-slate-900">
                    Track progress
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    See every report on the map, follow its status, and understand what&apos;s
                    been scheduled or fixed.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col gap-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-sky-500 to-cyan-500 text-[13px] font-semibold text-white shadow-sm">
                    3
                  </div>
                  <h3 className="mt-1 text-sm font-medium text-slate-900">
                    Earn recognition
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Climb the leaderboard, unlock badges, and build a history of the
                    hazards you&apos;ve helped resolve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
