'use client';

export default function ContributionStatsBar({ stats }) {
  const { reported, in_progress, fixed } = stats;
  const total = reported + in_progress + fixed;
  
  if (total === 0) {
    return (
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-3"></div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Reported: 0</span>
          <span>In Progress: 0</span>
          <span>Fixed: 0</span>
        </div>
      </div>
    );
  }

  const reportedPercent = (reported / total) * 100;
  const inProgressPercent = (in_progress / total) * 100;
  const fixedPercent = (fixed / total) * 100;

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
        {reported > 0 && (
          <div
            className="bg-blue-500"
            style={{ width: `${reportedPercent}%` }}
            title={`Reported: ${reported}`}
          ></div>
        )}
        {in_progress > 0 && (
          <div
            className="bg-yellow-500"
            style={{ width: `${inProgressPercent}%` }}
            title={`In Progress: ${in_progress}`}
          ></div>
        )}
        {fixed > 0 && (
          <div
            className="bg-green-500"
            style={{ width: `${fixedPercent}%` }}
            title={`Fixed: ${fixed}`}
          ></div>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span>Reported: {reported}</span>
        <span>In Progress: {in_progress}</span>
        <span>Fixed: {fixed}</span>
      </div>
    </div>
  );
}

