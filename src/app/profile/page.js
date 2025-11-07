'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IssueCard from '@/components/IssueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import LevelProgress from '@/components/LevelProgress';
import ContributionStatsBar from '@/components/ContributionStatsBar';
import AchievementsGrid from '@/components/AchievementsGrid';
import XPToast from '@/components/XPToast';
import LevelUpToast from '@/components/LevelUpToast';
import { getMockUserProgress } from '@/data/mockUserData';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [xpToast, setXpToast] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (!userData) {
        // Redirect to sign in if not authenticated
        router.push('/signin?redirect=/profile');
        return;
      }
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Load mock user progress data
        const progress = getMockUserProgress(parsedUser.id);
        setUserProgress(progress);
        fetchProfile(parsedUser);
      } catch (e) {
        router.push('/signin?redirect=/profile');
      }
    }
  }, [router]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  const confirmSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const cancelSignOut = () => {
    setShowSignOutConfirm(false);
  };

  const fetchProfile = async (currentUser) => {
    try {
      // Fetch recent reports
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const reports = await reportsResponse.json();
        setRecentReports(reports.slice(0, 5)); // Last 5 reports
      }

      // Fetch leaderboard to find user's position
      if (currentUser?.id) {
        const leaderboardResponse = await fetch('/api/leaderboard?period=all');
        if (leaderboardResponse.ok) {
          const leaderboard = await leaderboardResponse.json();
          const position = leaderboard.findIndex((entry) => entry.userId === currentUser.id);
          if (position !== -1) {
            setLeaderboardPosition(position + 1); // +1 because position is 0-indexed
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  if (!user) {
    return null; // Will redirect, so don't render anything
  }

  const displayUser = {
    ...user,
    avatar: user.avatar || null,
    bio: user.bio || null,
    location: user.location || null,
    totalReports: recentReports.length,
    fixedRate: 0,
    memberSince: user.memberSince || null,
  };

  // Format member since date
  const formatMemberSince = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Format the date
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Calculate time ago
    let timeAgo = '';
    if (diffYears > 0) {
      timeAgo = `${diffYears} ${diffYears === 1 ? 'year' : 'years'}`;
    } else if (diffMonths > 0) {
      timeAgo = `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
    } else if (diffDays > 0) {
      timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else {
      timeAgo = 'today';
    }

    return {
      formattedDate,
      timeAgo,
    };
  };

  const memberInfo = displayUser.memberSince ? formatMemberSince(displayUser.memberSince) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {displayUser.avatar ? (
              <img
                src={displayUser.avatar}
                alt={displayUser.displayName}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                {displayUser.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {displayUser.displayName || 'User'}
                  </h1>
                  {/* Level Progress Header */}
                  {userProgress && (
                    <LevelProgress
                      level={userProgress.currentLevel}
                      currentXP={userProgress.totalXP}
                      xpForCurrentLevel={userProgress.xpForCurrentLevel}
                      xpToNextLevel={userProgress.xpToNextLevel}
                      animate={true}
                    />
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium self-start md:self-auto"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              {memberInfo && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Member since:</span>{' '}
                    {memberInfo.formattedDate}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Member for {memberInfo.timeAgo}
                  </p>
                </div>
              )}
              {isEditing ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={displayUser.displayName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      defaultValue={displayUser.bio || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue={displayUser.location || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // In a real app, this would save to the backend
                        alert('Profile update functionality will be connected to backend');
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {displayUser.bio && (
                    <p className="text-gray-600 mb-2">{displayUser.bio}</p>
                  )}
                  {displayUser.location && (
                    <p className="text-sm text-gray-500">{displayUser.location}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contribution Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {displayUser.totalReports || 0}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              {userProgress && userProgress.reportStats && (
                <ContributionStatsBar stats={userProgress.reportStats} />
              )}
              {leaderboardPosition !== null && (
                <div>
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    #{leaderboardPosition}
                  </div>
                  <div className="text-sm text-gray-600">
                    Leaderboard Position{' '}
                    <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 text-xs">
                      (View)
                    </Link>
                  </div>
                </div>
              )}
              {userProgress && userProgress.streak.current > 0 && (
                <div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {userProgress.streak.current} days
                  </div>
                  <div className="text-sm text-gray-600">
                    Current Streak (Longest: {userProgress.streak.longest} days)
                  </div>
                </div>
              )}
              {displayUser.fixedRate !== undefined && (
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {displayUser.fixedRate}%
                  </div>
                  <div className="text-sm text-gray-600">Fixed Rate</div>
                </div>
              )}
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <Link
                href="/me/reports"
                className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                My Reports
              </Link>
              
              {/* Recent Activity Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
                {recentReports.length === 0 ? (
                  <p className="text-xs text-gray-500 mb-2">No recent activity</p>
                ) : (
                  <div className="space-y-2">
                    {recentReports.slice(0, 3).map((report) => (
                      <Link
                        key={report.id}
                        href={`/issue/${report.id}`}
                        className="block text-xs text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1">
                            {report.issueType?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Issue'}
                          </span>
                          <span className="text-gray-400 ml-2">
                            {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {recentReports.length > 3 && (
                  <Link
                    href="/me/reports"
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                  >
                    View all activity →
                  </Link>
                )}
              </div>
              
              <button
                onClick={confirmSignOut}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 mt-4"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {userProgress && (
            <AchievementsGrid earnedAchievements={userProgress.earnedAchievements} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentReports.length === 0 ? (
            <EmptyState
              title="No Reports Yet"
              description="Start contributing by reporting your first issue!"
              actionLabel="Report an Issue"
              actionHref="/report"
            />
          ) : (
            <div className="grid gap-4">
              {recentReports.map((report) => (
                <IssueCard key={report.id} issue={report} />
              ))}
            </div>
          )}
        </div>

        {/* Recent XP Events */}
        {userProgress && userProgress.recentXPEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent XP</h2>
            <div className="space-y-2">
              {userProgress.recentXPEvents.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{event.label}</span>
                  <span className="font-semibold text-green-600">+{event.amount} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* XP Toast */}
      {xpToast && (
        <XPToast
          message={xpToast.message}
          amount={xpToast.amount}
          onClose={() => setXpToast(null)}
        />
      )}

      {/* Level Up Toast */}
      {showLevelUp && userProgress && (
        <LevelUpToast
          level={userProgress.currentLevel}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Out</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out? You'll need to sign in again to access your profile and reports.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelSignOut}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

