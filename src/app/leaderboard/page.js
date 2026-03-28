'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const PODIUM_STYLES = {
  1: {
    shell: 'border-amber-300/35 shadow-[0_26px_80px_rgba(251,191,36,0.28)] bg-gradient-to-b from-amber-200/18 via-slate-900/86 to-slate-950/96',
    accent: 'text-amber-300',
    chip: 'bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-[0_14px_32px_rgba(251,191,36,0.45)]',
    halo: 'from-amber-300/35 via-yellow-200/18 to-transparent',
    ring: 'ring-amber-300/35',
    score: 'from-amber-400 to-yellow-500',
    icon: '👑',
    height: 'sm:min-h-[29rem]',
    avatar: 'h-36 w-36',
    title: 'text-4xl',
  },
  2: {
    shell: 'border-slate-200/35 shadow-[0_22px_60px_rgba(226,232,240,0.2)] bg-gradient-to-b from-slate-200/15 via-slate-900/84 to-slate-950/96',
    accent: 'text-slate-200',
    chip: 'bg-gradient-to-br from-slate-100 to-slate-400 text-slate-950 shadow-[0_12px_28px_rgba(226,232,240,0.28)]',
    halo: 'from-slate-200/25 via-slate-100/10 to-transparent',
    ring: 'ring-slate-200/30',
    score: 'from-slate-200 to-slate-400',
    icon: '✦',
    height: 'sm:min-h-[25.5rem]',
    avatar: 'h-[7.5rem] w-[7.5rem]',
    title: 'text-3xl',
  },
  3: {
    shell: 'border-orange-300/20 shadow-[0_22px_62px_rgba(249,115,22,0.24)] bg-gradient-to-b from-orange-200/16 via-slate-900/86 to-slate-950/96',
    accent: 'text-orange-300',
    chip: 'bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-[0_10px_24px_rgba(249,115,22,0.32)]',
    halo: 'from-orange-300/30 via-amber-300/14 to-transparent',
    ring: 'ring-orange-300/28',
    score: 'from-orange-500 to-amber-700',
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
    <div
      className={`${className} rounded-full flex items-center justify-center bg-white/10 border border-white/15 font-semibold ${textClassName}`}
    >
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
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${styles.halo}`} />

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

        <p className="mt-2 text-sm text-slate-300">
          {user.location || 'Community contributor'}
        </p>

        <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
          <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
            <span className="text-slate-300">Rank</span>
            <span className={`font-semibold ${styles.accent}`}>{formatRank(user.rank)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
            <span className="text-slate-300">Reports submitted</span>
            <span className={`font-semibold ${styles.accent}`}>{user.totalReports}</span>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <span className="text-slate-300">Recognition</span>
            <span className={`font-semibold ${styles.accent}`}>
              {user.rank === 1 ? 'Neighborhood champion' : user.rank === 2 ? 'Momentum builder' : 'Rising helper'}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r px-6 py-3 text-lg font-semibold text-white ${styles.score}`}>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/90">
              Total
            </span>
            <span>{user.totalReports}</span>
          </div>
          {isCurrentUser && (
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.25em] text-white/70">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Community recognition
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Leaderboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Recognizing the neighbors who submit the most road-safety reports and keep the map active.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/60 p-1.5">
            <button
              onClick={() => setTimeFilter('all')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                timeFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_10px_25px_rgba(59,130,246,0.3)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                timeFilter === 'week'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_10px_25px_rgba(59,130,246,0.3)]'
                  : 'text-slate-300 hover:text-white'
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

            <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mt-14">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">More contributors</h2>
                  <p className="text-sm text-slate-400">
                    Everyone else ranked cleanly below the podium.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Ranked list
                </span>
              </div>

              {remaining.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
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
                            ? 'border-blue-400/35 bg-blue-500/10 shadow-[0_14px_35px_rgba(59,130,246,0.18)]'
                            : 'border-white/10 bg-slate-950/45 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-200">
                            #{user.rank}
                          </div>
                          <Avatar
                            user={user}
                            className="h-12 w-12"
                            textClassName="text-sm text-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-white">
                                {user.displayName || `User ${user.userId}`}
                              </p>
                              {isCurrentUser && (
                                <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">
                              {user.location || 'Community contributor'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                              Reports
                            </p>
                            <p className="text-2xl font-semibold text-white">{user.totalReports}</p>
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
