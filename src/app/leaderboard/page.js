'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const PODIUM_STYLES = {
  1: {
    shell: 'border-green-200 bg-white shadow-sm',
    accent: 'text-green-800',
    chip: 'bg-green-800 text-white',
    halo: '',
    ring: 'ring-green-100',
    score: 'bg-green-800',
    icon: '👑',
    height: 'sm:min-h-[29rem]',
    avatar: 'h-36 w-36',
    title: 'text-4xl',
  },
  2: {
    shell: 'border-green-100 bg-white shadow-sm',
    accent: 'text-green-700',
    chip: 'bg-green-700 text-white',
    halo: '',
    ring: 'ring-green-100',
    score: 'bg-green-700',
    icon: '✦',
    height: 'sm:min-h-[25.5rem]',
    avatar: 'h-[7.5rem] w-[7.5rem]',
    title: 'text-3xl',
  },
  3: {
    shell: 'border-green-100 bg-white shadow-sm',
    accent: 'text-green-600',
    chip: 'bg-green-600 text-white',
    halo: '',
    ring: 'ring-green-100',
    score: 'bg-green-600',
    icon: '✦',
    height: 'sm:min-h-[23.5rem]',
    avatar: 'h-24 w-24',
    title: 'text-2xl',
  },
};

function formatRank(value) {
  if (value === 1) return '1st';
  if (value === 2) return '2nd';
  if (value === 3) return '3rd';
  return `${value}th`;
}

function initials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'U';
}

function Avatar({ user, className, textClassName }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.displayName}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${className} rounded-full flex items-center justify-center bg-green-50 border border-green-100 font-semibold ${textClassName}`}>
      {initials(user.displayName)}
    </div>
  );
}

function PodiumCard({ user, isCurrentUser, isVisible, delayMs }) {
  const styles = PODIUM_STYLES[user.rank];

  return (
    <article
      className={`relative ${styles.height} overflow-hidden rounded-[2rem] border p-6 sm:p-8 will-change-transform transition-[transform,opacity] duration-700 ease-out ${styles.shell} ${isCurrentUser ? 'ring-2 ring-white/40' : ''} ${
        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.94] opacity-0'
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className="relative flex h-full flex-col items-center text-center">
        <div className="mb-4 flex w-full items-start justify-between">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold ${styles.chip}`}>
            {user.rank}
          </span>
          <span className={`text-4xl ${styles.accent}`}>{styles.icon}</span>
        </div>

        <div className={`mb-5 rounded-full bg-white/5 p-2 ring-4 ${styles.ring}`}>
          <Avatar
            user={user}
            className={styles.avatar}
            textClassName={`${user.rank === 1 ? 'text-3xl' : user.rank === 2 ? 'text-2xl' : 'text-xl'} ${styles.accent}`}
          />
        </div>

        <h2 className={`${styles.title} font-semibold ${styles.accent}`}>
          {user.displayName || `User ${user.userId}`}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {user.location || 'Community contributor'}
        </p>

        <div className="mt-8 w-full rounded-2xl border border-green-100 bg-green-50 p-4 text-left">
          <div className="flex items-center justify-between border-b border-green-100 py-3 text-sm">
            <span className="text-gray-600">Rank</span>
            <span className={`font-semibold ${styles.accent}`}>{formatRank(user.rank)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-green-100 py-3 text-sm">
            <span className="text-gray-600">Reports submitted</span>
            <span className={`font-semibold ${styles.accent}`}>{user.totalReports}</span>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <span className="text-gray-600">Recognition</span>
            <span className={`font-semibold ${styles.accent}`}>
              {user.rank === 1 ? 'Neighborhood champion' : user.rank === 2 ? 'Momentum builder' : 'Rising helper'}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className={`inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-semibold text-white ${styles.score}`}>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
              Total
            </span>
            <span>{user.totalReports}</span>
          </div>
          {isCurrentUser && (
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.25em] text-green-700">
              You
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [podiumVisible, setPodiumVisible] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  useEffect(() => {
    if (loading) {
      setPodiumVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setPodiumVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [loading, leaderboard.length]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const [sessionResponse, leaderboardResponse] = await Promise.all([
        fetch('/api/auth/session', { cache: 'no-store' }),
        fetch(`/api/leaderboard?period=${timeFilter}`, { cache: 'no-store' }),
      ]);

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setCurrentUserId(sessionData.user?.id ?? null);
      } else {
        setCurrentUserId(null);
      }

      if (!leaderboardResponse.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await leaderboardResponse.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const podiumSlots = [
    topThree.find((user) => user.rank === 2),
    topThree.find((user) => user.rank === 1),
    topThree.find((user) => user.rank === 3),
  ].filter(Boolean);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-green-700">
              Community recognition
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Leaderboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
              Recognizing the neighbors who submit the most road-safety reports and keep the map active.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-green-100 bg-green-50 p-1.5">
            <button
              onClick={() => setTimeFilter('all')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                timeFilter === 'all'
                  ? 'bg-green-700 text-white'
                  : 'text-gray-700 hover:text-green-800'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                timeFilter === 'week'
                  ? 'bg-green-700 text-white'
                  : 'text-gray-700 hover:text-green-800'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <EmptyState
            title="No Leaderboard Data Yet"
            description="The leaderboard will update once signed-in users submit reports."
            actionLabel="Report an Issue"
            actionHref="/report"
          />
        ) : (
          <div className="space-y-16">
            <section className="grid gap-8 sm:grid-cols-3 sm:items-end">
              {podiumSlots.map((user) => (
                <PodiumCard
                  key={user.userId}
                  user={user}
                  isCurrentUser={user.userId === currentUserId}
                  isVisible={podiumVisible}
                  delayMs={user.rank === 2 ? 0 : user.rank === 1 ? 140 : 260}
                />
              ))}
            </section>

            <section className="mt-10 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm sm:mt-14">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">More contributors</h2>
                  <p className="text-sm text-gray-500">
                    Everyone else ranked cleanly below the podium.
                  </p>
                </div>
                <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-green-700">
                  Ranked list
                </span>
              </div>

              {remaining.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-green-100 bg-green-50 px-4 py-6 text-center text-sm text-gray-500">
                  No additional ranked users yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {remaining.map((user) => {
                    const isCurrentUser = user.userId === currentUserId;

                    return (
                      <div
                        key={user.userId}
                        className={`flex flex-col gap-4 rounded-2xl border px-4 py-4 transition sm:flex-row sm:items-center sm:justify-between ${
                          isCurrentUser
                            ? 'border-green-300 bg-green-50'
                            : 'border-green-100 bg-white hover:border-green-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-sm font-semibold text-green-700">
                            #{user.rank}
                          </div>
                          <Avatar
                            user={user}
                            className="h-12 w-12"
                            textClassName="text-sm text-green-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-gray-900">
                                {user.displayName || `User ${user.userId}`}
                              </p>
                              {isCurrentUser && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-green-700">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {user.location || 'Community contributor'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                              Reports
                            </p>
                            <p className="text-2xl font-semibold text-green-700">{user.totalReports}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
