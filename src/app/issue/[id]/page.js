'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/client/csrf';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

const STATUS_OPTIONS = [
  { value: 'reported', label: 'Reported' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fixed', label: 'Fixed' },
];

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params?.id;
  const [issue, setIssue] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (issueId) {
      fetchData();
    }
  }, [issueId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issueResponse, sessionResponse] = await Promise.all([
        fetch(`/api/reports/${issueId}`, { cache: 'no-store' }),
        fetch('/api/auth/session', { cache: 'no-store' }),
      ]);

      if (!issueResponse.ok) {
        setError(issueResponse.status === 404 ? 'not_found' : 'error');
        return;
      }

      const issueData = await issueResponse.json();
      setIssue(issueData);

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setCurrentUser(sessionData.user ?? null);
      }
    } catch (fetchError) {
      setError('error');
      console.error('Error fetching issue:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    try {
      setIsSavingStatus(true);
      setActionError(null);

      const response = await apiFetch(`/api/reports/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update report status');
      }

      setIssue(data);
    } catch (updateError) {
      setActionError(updateError.message);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this report? This cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setActionError(null);

      const response = await apiFetch(`/api/reports/${issueId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete report');
      }

      router.push('/map');
      router.refresh();
    } catch (deleteError) {
      setActionError(deleteError.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/issue/${issueId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const formatIssueType = (type) => {
    return type?.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Hazard';
  };

  const images = issue?.imageUrls || (issue?.imageUrl ? [issue.imageUrl] : []);
  const canManage = Boolean(
    currentUser && issue && (currentUser.role === 'admin' || currentUser.id === issue.userId)
  );
  const canModerateStatus = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <EmptyState
            title="Report Not Found"
            description="The report you're looking for doesn't exist or has been removed."
            actionLabel="Back to Map"
            actionHref="/map"
          />
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <EmptyState
            title="Error Loading Report"
            description="There was an error loading the report. Please try again later."
            actionLabel="Back to Map"
            actionHref="/map"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formatIssueType(issue.issueType)}
              </h1>
              <StatusBadge status={issue.status} className="text-sm" />
            </div>
            <Link
              href="/map"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Back to Map
            </Link>
          </div>

          {actionError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {canModerateStatus && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700">Admin status update</label>
              <select
                value={issue.status}
                onChange={(event) => handleStatusChange(event.target.value)}
                disabled={isSavingStatus}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={`${formatIssueType(issue.issueType)} - ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover rounded-lg"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {issue.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700">{issue.description}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Severity</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(issue.severity / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">{issue.severity}/5</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Coordinates:</span>{' '}
                {issue.latitude?.toFixed(6)}, {issue.longitude?.toFixed(6)}
              </div>
              {issue.address && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Address:</span> {issue.address}
                </div>
              )}
              <div className="h-48 rounded-lg overflow-hidden border border-gray-300">
                <Map
                  reports={[issue]}
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <div className="font-semibold text-gray-900">Report Created</div>
                <div className="text-sm text-gray-600">
                  {new Date(issue.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">Last Updated</div>
                  <div className="text-sm text-gray-600">
                    {new Date(issue.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyLink}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Copy Link
            </button>
            <Link
              href="/map"
              className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View on Map
            </Link>
            {canManage && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
