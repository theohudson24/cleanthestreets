'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

function ReportSuccessPageContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams?.get('id');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(!!reportId);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/issue/${reportId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Your report has been submitted successfully. We&apos;ll review it and update the status as it&apos;s being addressed.
          </p>

          {report && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Report Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-semibold">ID:</span> {report.id}</div>
                <div><span className="font-semibold">Category:</span> {report.issueType?.replace('_', ' ')}</div>
                <div><span className="font-semibold">Status:</span> {report.status}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {reportId && (
              <>
                <Link
                  href={`/issue/${reportId}`}
                  className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                >
                  View Report
                </Link>
                <button
                  onClick={copyShareLink}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Share Link
                </button>
              </>
            )}
            <Link
              href="/map"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Open Map
            </Link>
            <Link
              href="/profile"
              className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ReportSuccessPageContent />
    </Suspense>
  );
}
