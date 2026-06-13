'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/client/csrf';
import IssueCard from '@/components/IssueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ContributionStatsBar from '@/components/ContributionStatsBar';
import { applyTheme } from '@/components/ThemeProvider';

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
    themePreference: 'light',
  });
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
        themePreference: profileData.themePreference || 'light',
      });
      applyTheme(profileData.themePreference || 'light');

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

  const handleThemeChange = async (themePreference) => {
    try {
      setSavingTheme(true);
      setSettingsError(null);
      setSettingsSuccess(null);

      const nextState = { ...formState, themePreference };
      setFormState(nextState);
      applyTheme(themePreference);
      window.localStorage.setItem('cleanthestreets-theme', themePreference);

      const response = await apiFetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save theme preference');
      }

      setUser(data);
      setSettingsSuccess('Theme preference saved.');
    } catch (error) {
      setSettingsError(error.message);
      const fallbackTheme = user?.themePreference || 'light';
      setFormState((current) => ({ ...current, themePreference: fallbackTheme }));
      applyTheme(fallbackTheme);
    } finally {
      setSavingTheme(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setSettingsError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const response = await apiFetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordState.currentPassword,
          newPassword: passwordState.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setUser((current) => ({
        ...current,
        passwordUpdatedAt: data.passwordUpdatedAt,
      }));
      setPasswordState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSettingsSuccess('Password updated successfully.');
    } catch (error) {
      setSettingsError(error.message);
    } finally {
      setSavingPassword(false);
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
  const passwordUpdatedAt = user.passwordUpdatedAt
    ? new Date(user.passwordUpdatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  return (
    <div className="min-h-screen bg-white text-gray-900">
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
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors text-sm font-medium self-start md:self-auto"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-60"
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

        <div className="grid lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contribution Stats</h2>
            <div className="space-y-5">
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <div className="text-3xl font-bold text-green-800 mb-1">
                  {user.totalReports || 0}
                </div>
                <div className="text-sm font-medium text-green-900">Total Reports</div>
                <p className="mt-1 text-xs text-green-800">
                  Issues you have submitted for community tracking.
                </p>
              </div>
              {user.reportStats && <ContributionStatsBar stats={user.reportStats} />}
              {leaderboardPosition !== null && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    #{leaderboardPosition}
                  </div>
                  <div className="text-sm text-gray-600">
                    Leaderboard Position{' '}
                    <Link href="/leaderboard" className="text-green-700 hover:text-green-900 text-xs">
                      (View)
                    </Link>
                  </div>
                </div>
              )}
              <Link
                href="/me/reports"
                className="block rounded-lg border border-green-200 bg-white px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-50 transition-colors"
              >
                My Reports
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-3">
            <div className="flex flex-col gap-1 mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
              <p className="text-sm text-gray-600">
                Manage your password, appearance, and account session.
              </p>
            </div>

            {settingsError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {settingsSuccess}
              </div>
            )}

            <div className="space-y-6">
              <section>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Theme</h3>
                    <p className="text-xs text-gray-500">
                      Your theme preference is saved to your account.
                    </p>
                  </div>
                  {savingTheme && <span className="text-xs text-gray-500">Saving...</span>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
                  {[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ].map((theme) => {
                    const isSelected = formState.themePreference === theme.value;

                    return (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => handleThemeChange(theme.value)}
                        disabled={savingTheme || isSelected}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-green-700 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-white'
                        }`}
                      >
                        {theme.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="border-t border-gray-200 pt-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">
                    Last updated: {passwordUpdatedAt}
                  </p>
                </div>
                <form onSubmit={handlePasswordChange} className="grid gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordState.currentPassword}
                      onChange={(event) =>
                        setPasswordState((current) => ({
                          ...current,
                          currentPassword: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordState.newPassword}
                        onChange={(event) =>
                          setPasswordState((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordState.confirmPassword}
                        onChange={(event) =>
                          setPasswordState((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={
                      savingPassword ||
                      !passwordState.currentPassword ||
                      !passwordState.newPassword ||
                      !passwordState.confirmPassword
                    }
                    className="w-full sm:w-auto sm:justify-self-start px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-60"
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </section>

              <section className="border-t border-gray-200 pt-5">
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="w-full px-4 py-2 bg-red-900/70 text-red-100 border border-red-500/40 rounded-md hover:bg-red-900 transition-colors"
                >
                  Sign Out
                </button>
              </section>
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
