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
        const data = await response.json();
        const reports = data.items ?? [];
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
    <div className="min-h-screen bg-white text-gray-900">
      {/* main content sits under your existing global navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main layout: hero + stats card */}
        <main className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
          {/* Left: Hero + search + primary actions */}
          <section>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              <span className="text-gray-900">Make your streets</span>
              <span className="block text-green-700">safer and smoother.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mb-6">
              Report potholes and road hazards in seconds. Track fixes over time and
              climb the community leaderboard as a neighborhood hero.
            </p>

            {/* Primary actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-white hover:bg-green-800 transition"
              >
                Report an issue
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center justify-center rounded-full border border-green-700 px-6 py-3 text-sm font-medium text-green-700 hover:bg-green-50 transition"
              >
                Open map
              </Link>
            </div>

            {/* Search bar */}
            <div className="max-w-xl">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 rounded-2xl border border-green-100 bg-white px-3 py-2 shadow-sm"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an address or place…"
                  className="flex-1 border-none bg-transparent px-2 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800 transition"
                >
                  Search
                </button>
              </form>
              <p className="mt-2 text-xs text-gray-500">
                Try a street name, intersection, or neighborhood.
              </p>
            </div>
          </section>

          {/* Right: Stats card */}
          <aside>
            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">This week at a glance</h2>
                  <p className="text-xs text-gray-500">Live stats from community reports.</p>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
                  Updated in real time
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                  <div className="text-[11px] font-semibold text-gray-600 mb-2">Total reports</div>
                  <div className="text-2xl font-semibold text-gray-900 leading-tight">
                    {loading ? <LoadingSpinner size="sm" className="mx-auto" /> : stats.total ?? '—'}
                  </div>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                  <div className="text-[11px] font-semibold text-gray-600 mb-2">Fixed issues</div>
                  <div className="text-2xl font-semibold text-green-700 leading-tight">
                    {loading ? <LoadingSpinner size="sm" className="mx-auto" /> : stats.fixed ?? '—'}
                  </div>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                  <div className="text-[11px] font-semibold text-gray-600 mb-2">Last 7 days</div>
                  <div className="text-2xl font-semibold text-green-600 leading-tight">
                    {loading ? <LoadingSpinner size="sm" className="mx-auto" /> : stats.recent ?? '—'}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-green-200 bg-green-50 p-4">
                <p className="text-xs text-gray-600 mb-1">Want to see where these reports are coming from?</p>
                <Link href="/leaderboard" className="text-xs font-semibold text-green-700 hover:text-green-900">
                  View community leaderboard →
                </Link>
              </div>
            </div>
          </aside>
        </main>

        {/* How it works – Linear-inspired glass */}
        <section className="mt-16">
          <div className="rounded-3xl border border-green-100 bg-white text-gray-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">How it works</h2>
                <p className="text-xs sm:text-sm text-gray-600">Three simple steps to make your neighborhood safer.</p>
              </div>
              <span className="hidden sm:inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 border border-green-100">
                Built for quick, repeat reporting
              </span>
            </div>

            <div className="relative mt-4">
              <div className="grid gap-8 sm:grid-cols-3">
                {/* Step 1 */}
                <div className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-sm font-semibold">
                      1
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">Report an issue</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Snap a photo, drop a pin on the map, and submit a quick report with location and severity.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-sm font-semibold">
                      2
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">Track progress</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    See every report on the map, follow its status, and understand what&apos;s been scheduled or fixed.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-sm font-semibold">
                      3
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">Earn recognition</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Climb the leaderboard, unlock badges, and build a history of the hazards you&apos;ve helped resolve.
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
