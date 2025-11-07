'use client';

import { useState } from 'react';
import { getAchievementById } from '@/data/achievements';

export default function AchievementTile({ achievementId, isEarned, earnedAt, onClick }) {
  const achievement = getAchievementById(achievementId);
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!achievement) return null;

  return (
    <div className="relative">
      <button
        onClick={() => onClick(achievement)}
        onMouseEnter={() => !isEarned && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative p-4 rounded-lg border-2 transition-all w-full ${
          isEarned
            ? 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-md'
            : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        aria-label={`${achievement.title} - ${isEarned ? 'Earned' : 'Locked'}`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <div className="text-sm font-semibold text-gray-900 mb-1">{achievement.title}</div>
          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
            isEarned
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {isEarned ? 'Earned' : 'Locked'}
          </div>
        </div>
      </button>
      
      {/* Hover Tooltip for Locked Achievements */}
      {!isEarned && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg p-3 z-10 min-w-[200px] max-w-[250px]">
          <p className="font-semibold mb-1">{achievement.title}</p>
          <p className="text-gray-300">{achievement.criteria}</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}

