'use client';

export default function AchievementSheet({ achievement, isEarned, earnedAt, onClose }) {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{achievement.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{achievement.title}</h2>
              {isEarned && earnedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Earned {new Date(earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-3">{achievement.description}</p>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm font-semibold text-gray-900 mb-1">How to earn:</p>
            <p className="text-sm text-gray-600">{achievement.criteria}</p>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-md text-center ${
          isEarned
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          <span className="text-sm font-medium">
            {isEarned ? '✓ Achievement Earned' : '🔒 Achievement Locked'}
          </span>
        </div>
      </div>
    </div>
  );
}

