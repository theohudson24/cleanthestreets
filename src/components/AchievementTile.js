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
            ? 'bg-gradient-to-br from-indigo-500/30 via-blue-500/20 to-slate-900/80 border-indigo-400/40 shadow-[0_18px_45px_rgba(59,130,246,0.35)] hover:shadow-[0_25px_55px_rgba(59,130,246,0.45)] text-slate-50'
            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-indigo-400/40'
        } focus:outline-none focus:ring-2 focus:ring-indigo-400/60`}
        aria-label={`${achievement.title} - ${isEarned ? 'Earned' : 'Locked'}`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <div className={`text-sm font-semibold mb-1 ${isEarned ? 'text-slate-50' : 'text-slate-300'}`}>
            {achievement.title}
          </div>
          <div
            className={`text-xs px-3 py-1 rounded-full inline-block ${
              isEarned
                ? 'bg-white/15 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isEarned ? 'Earned' : 'Locked'}
          </div>
        </div>
      </button>
      
      {/* Hover Tooltip for Locked Achievements */}
      {!isEarned && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg p-3 z-10 min-w-[200px] max-w-[250px]">
          <p className="font-semibold mb-1">{achievement.title}</p>
          <p className="text-gray-300">{achievement.criteria}</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
