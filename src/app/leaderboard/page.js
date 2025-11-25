'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { getMockLeaderboard } from '@/data/mockUserData';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' or 'week'
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUserId(user.id);
        } catch (e) {
          // Ignore
        }
      }
    }
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      // For MVP, use mock data
      const data = getMockLeaderboard(timeFilter);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>

        {/* Time Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeFilter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <EmptyState
            title="Leaderboard Coming Soon"
            description="The leaderboard will update as reports come in. Be the first to contribute!"
            actionLabel="Report an Issue"
            actionHref="/report"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-900/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Total Reports
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/5">
                {leaderboard.map((user, index) => {
                  const isCurrentUser = user.userId === currentUserId;
                  const isPodium = index < 3;
                  const podiumShadow =
                    index === 0
                      ? 'shadow-[0_0_35px_rgba(250,204,21,0.25)] border-amber-300/30'
                      : index === 1
                        ? 'shadow-[0_0_35px_rgba(148,163,184,0.25)] border-slate-200/25'
                        : 'shadow-[0_0_35px_rgba(249,115,22,0.25)] border-orange-300/25';
                  const rowClass = isPodium
                    ? `relative bg-slate-900/70 border ${podiumShadow}`
                    : isCurrentUser
                      ? 'bg-blue-900/40 border border-blue-400/30'
                      : 'bg-transparent';
                  return (
                    <tr
                      key={user.userId}
                      className={`${rowClass} transition relative overflow-hidden`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-semibold ${isPodium ? 'text-white' : 'text-gray-900'}`}>
                            #{index + 1}
                          </span>
                          {index === 0 && <span className="ml-2 text-2xl">🥇</span>}
                          {index === 1 && <span className="ml-2 text-2xl">🥈</span>}
                          {index === 2 && <span className="ml-2 text-2xl">🥉</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.avatar && (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {user.displayName || `User ${user.userId}`}
                            </span>
                            {isCurrentUser && user.currentLevel && (
                              <div className="text-xs text-blue-300 font-semibold mt-1">
                                Level {user.currentLevel}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {user.totalReports ?? 0} reports
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
