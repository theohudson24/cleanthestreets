'use client';

const STATUS_ITEMS = [
  {
    key: 'reported',
    label: 'Reported',
    helper: 'Awaiting review',
    className: 'border-green-100 bg-green-50 text-green-800',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    helper: 'Being addressed',
    className: 'border-green-200 bg-white text-gray-800',
  },
  {
    key: 'fixed',
    label: 'Fixed',
    helper: 'Resolved',
    className: 'border-green-200 bg-green-100 text-green-900',
  },
];

export default function ContributionStatsBar({ stats }) {
  return (
    <div className="grid gap-3">
      {STATUS_ITEMS.map((item) => (
        <div
          key={item.key}
          className={`rounded-lg border p-4 ${item.className}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="mt-1 text-xs opacity-80">{item.helper}</div>
            </div>
            <div className="text-2xl font-semibold leading-none">
              {stats?.[item.key] || 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
