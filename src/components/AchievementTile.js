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
        className={`relative p-4 rounded-2xl border transition-all w-full ${
          isEarned
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-white border-green-100 text-gray-500 hover:border-green-200'
        } focus:outline-none focus:ring-2 focus:ring-green-200`}
        aria-label={`${achievement.title} - ${isEarned ? 'Earned' : 'Locked'}`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <div className={`text-sm font-semibold mb-1 ${isEarned ? 'text-green-800' : 'text-gray-600'}`}>
            {achievement.title}
          </div>
          <div
            className={`text-xs px-3 py-1 rounded-full inline-block ${
              isEarned
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isEarned ? 'Earned' : 'Locked'}
          </div>
        </div>
      </button>
      
      {/* Hover Tooltip for Locked Achievements */}
      {!isEarned && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white text-gray-900 text-xs rounded-lg shadow-lg p-3 z-10 min-w-[200px] max-w-[250px] border border-green-100">
          <p className="font-semibold mb-1">{achievement.title}</p>
          <p className="text-gray-600">{achievement.criteria}</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
}
