'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function IssueCard({ issue }) {
  const formatIssueType = (type) => {
    return type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Hazard';
  };

  return (
    <Link href={`/issue/${issue.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className="flex items-start gap-4">
          {issue.imageUrl && (
            <img
              src={issue.imageUrl}
              alt={formatIssueType(issue.issueType)}
              className="w-24 h-24 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {formatIssueType(issue.issueType)}
              </h3>
              <StatusBadge status={issue.status} />
            </div>
            {issue.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {issue.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              {issue.severity && (
                <span>Severity: {issue.severity}/5</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

