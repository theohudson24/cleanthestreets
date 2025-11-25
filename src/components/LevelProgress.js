'use client';

import { useEffect, useState } from 'react';

export default function LevelProgress({ level, currentXP, xpForCurrentLevel, xpToNextLevel, animate = true }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const progress = ((currentXP - xpForCurrentLevel) / xpToNextLevel) * 100;
      setAnimatedProgress(0);
      setTimeout(() => {
        setAnimatedProgress(Math.min(progress, 100));
      }, 100);
    } else {
      const progress = ((currentXP - xpForCurrentLevel) / xpToNextLevel) * 100;
      setAnimatedProgress(Math.min(progress, 100));
    }
  }, [currentXP, xpForCurrentLevel, xpToNextLevel, animate]);

  const progressPercent = ((currentXP - xpForCurrentLevel) / xpToNextLevel) * 100;
  const displayPercent = Math.min(progressPercent, 100);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900">Level {level}</span>
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedProgress}%` }}
            role="progressbar"
            aria-valuenow={displayPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Level ${level} progress: ${displayPercent.toFixed(0)}%`}
          ></div>
        </div>
        <p className="text-xs text-gray-600">
          {currentXP - xpForCurrentLevel} of {xpToNextLevel} XP
        </p>
      </div>
    </div>
  );
}
