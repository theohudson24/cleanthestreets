'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/client/csrf';
import IssueCard from '@/components/IssueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ContributionStatsBar from '@/components/ContributionStatsBar';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    displayName: '',
    bio: '',
    location: '',
    avatarUrl: '',
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const profileResponse = await fetch('/api/profile', { cache: 'no-store' });
      if (profileResponse.status === 401) {
        router.push('/signin?redirect=/profile');
        return;
      }

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setUser(profileData);
      setFormState({
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        avatarUrl: profileData.avatarUrl || '',
      });

      const [reportsResponse, leaderboardResponse] = await Promise.all([
        fetch('/api/me/reports?limit=5', { cache: 'no-store' }),
        fetch('/api/leaderboard?period=all', { cache: 'no-store' }),
      ]);

      if (reportsResponse.ok) {
        const reports = await reportsResponse.json();
        setRecentReports(reports);
      }

      if (leaderboardResponse.ok) {
        const leaderboard = await leaderboardResponse.json();
        const position = leaderboard.findIndex((entry) => entry.userId === profileData.id);
        if (position !== -1) {
          setLeaderboardPosition(position + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await apiFetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setFormError(null);
      setFormSuccess(null);

      const response = await apiFetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data);
      setFormSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
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
    return null;
  }

  const memberSince = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {user.displayName || 'User'}
                  </h1>
                  {memberSince && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Member since:</span> {memberSince}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setFormError(null);
                    setFormSuccess(null);
                    setIsEditing(!isEditing);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium self-start md:self-auto"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {formError && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {formSuccess}
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
                      value={formState.displayName}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          displayName: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formState.bio}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          bio: event.target.value,
                        }))
                      }
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
                      value={formState.location}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={formState.avatarUrl}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          avatarUrl: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
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
                  {user.bio && (
                    <p className="text-gray-600 mb-2">{user.bio}</p>
                  )}
                  {user.location && (
                    <p className="text-sm text-gray-500">{user.location}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contribution Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {user.totalReports || 0}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              {user.reportStats && <ContributionStatsBar stats={user.reportStats} />}
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
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {user.fixedRate ?? 0}%
                </div>
                <div className="text-sm text-gray-600">Fixed Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <Link
                href="/me/reports"
                className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                My Reports
              </Link>

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
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate flex-1">
                            {report.issueType?.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Issue'}
                          </span>
                          <span className="text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
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
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full px-4 py-2 bg-red-900/70 text-red-100 border border-red-500/40 rounded-md hover:bg-red-900 mt-4 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

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
      </div>

      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Out</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out? You&apos;ll need to sign in again to access your profile and reports.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutConfirm(false)}
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
