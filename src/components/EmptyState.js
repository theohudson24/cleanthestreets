'use client';

import Link from 'next/link';

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  actionHref, 
  icon = null 
}) {
  return (
    <div className="text-center py-12 px-4">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

