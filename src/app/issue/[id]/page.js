'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import XPToast from '@/components/XPToast';
import { getMockUserProgress } from '@/data/mockUserData';
import { ACHIEVEMENTS_CATALOG } from '@/data/achievements';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

export default function IssueDetailsPage() {
  const params = useParams();
  const issueId = params?.id;
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userProgress, setUserProgress] = useState(null);
  const [nextAchievement, setNextAchievement] = useState(null);
  const [xpToast, setXpToast] = useState(null);

  useEffect(() => {
    if (issueId) {
      fetchIssue();
    }
    
    // Load user progress for achievement nudges
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const progress = getMockUserProgress(user.id);
          setUserProgress(progress);
          
          // Find next unearned achievement
          const earned = progress.earnedAchievements || [];
          const next = ACHIEVEMENTS_CATALOG.find(a => !earned.includes(a.id));
          setNextAchievement(next);
        } catch (e) {
          console.error('Error loading user progress:', e);
        }
      }
    }
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const response = await fetch(`/api/reports/${issueId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('not_found');
        } else {
          setError('error');
        }
        return;
      }
      const data = await response.json();
      setIssue(data);
    } catch (err) {
      setError('error');
      console.error('Error fetching issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/issue/${issueId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const formatIssueType = (type) => {
    return type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Hazard';
  };

  const images = issue?.imageUrls || (issue?.imageUrl ? [issue.imageUrl] : []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
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
          
          {/* Achievement Nudge */}
          {nextAchievement && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Tip:</span> {nextAchievement.criteria}
              </p>
            </div>
          )}
        </div>

        {/* Media Gallery */}
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
                    onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {issue.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700">{issue.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Severity */}
          {issue.severity && (
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
          )}

          {/* Location */}
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

        {/* Activity Timeline */}
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

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
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
          </div>
        </div>
      </div>

      {/* XP Toast */}
      {xpToast && (
        <XPToast
          message={xpToast.message}
          amount={xpToast.amount}
          onClose={() => setXpToast(null)}
        />
      )}
    </div>
  );
}

