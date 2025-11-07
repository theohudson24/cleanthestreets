'use client';

import { useState } from 'react';
import { ACHIEVEMENTS_CATALOG } from '@/data/achievements';
import AchievementTile from './AchievementTile';
import AchievementSheet from './AchievementSheet';

export default function AchievementsGrid({ earnedAchievements = [] }) {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isEarned, setIsEarned] = useState(false);
  const [earnedAt, setEarnedAt] = useState(null);

  const handleTileClick = (achievement) => {
    const earned = earnedAchievements.includes(achievement.id);
    setIsEarned(earned);
    // In a real app, fetch earnedAt from API
    setEarnedAt(earned ? new Date().toISOString() : null);
    setSelectedAchievement(achievement);
  };

  const handleCloseSheet = () => {
    setSelectedAchievement(null);
  };

  // Sort: earned first, then locked
  const sortedAchievements = [...ACHIEVEMENTS_CATALOG].sort((a, b) => {
    const aEarned = earnedAchievements.includes(a.id);
    const bEarned = earnedAchievements.includes(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return 0;
  });

  const earnedCount = earnedAchievements.length;
  const totalCount = ACHIEVEMENTS_CATALOG.length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
        <span className="text-sm text-gray-600">{earnedCount} of {totalCount} earned</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedAchievements.map((achievement) => (
          <AchievementTile
            key={achievement.id}
            achievementId={achievement.id}
            isEarned={earnedAchievements.includes(achievement.id)}
            onClick={handleTileClick}
          />
        ))}
      </div>
      {selectedAchievement && (
        <AchievementSheet
          achievement={selectedAchievement}
          isEarned={isEarned}
          earnedAt={earnedAt}
          onClose={handleCloseSheet}
        />
      )}
    </>
  );
}

