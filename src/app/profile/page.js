'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IssueCard from '@/components/IssueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

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
        fetchProfile();
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

  const fetchProfile = async () => {
    try {
      // Fetch recent reports
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const reports = await reportsResponse.json();
        setRecentReports(reports.slice(0, 5)); // Last 5 reports
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
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {displayUser.displayName || 'User'}
              </h1>
              {displayUser.bio && (
                <p className="text-gray-600 mb-2">{displayUser.bio}</p>
              )}
              {displayUser.location && (
                <p className="text-sm text-gray-500">{displayUser.location}</p>
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
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
    </div>
  );
}

