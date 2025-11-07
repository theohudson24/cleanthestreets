// Mock user data for MVP - replace with API calls later
import { ACHIEVEMENTS_CATALOG } from './achievements';

export const getMockUserProgress = (userId) => {
  // Different data for different users
  const userData = {
    'admin-1': {
      totalXP: 450,
      currentLevel: 3,
      xpToNextLevel: 150,
      xpForCurrentLevel: 300,
      reportStats: {
        reported: 15,
        in_progress: 5,
        fixed: 10,
      },
      streak: {
        current: 7,
        longest: 12,
      },
      earnedAchievements: ['first_report', 'on_a_roll', 'neighborhood_watch', 'fix_champion'],
      recentXPEvents: [
        { label: 'Report submitted', amount: 25, timestamp: new Date().toISOString() },
        { label: 'Photo added', amount: 10, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { label: 'Report validated', amount: 20, timestamp: new Date(Date.now() - 7200000).toISOString() },
      ],
    },
    'user-1': {
      totalXP: 180,
      currentLevel: 2,
      xpToNextLevel: 70,
      xpForCurrentLevel: 150,
      reportStats: {
        reported: 8,
        in_progress: 2,
        fixed: 3,
      },
      streak: {
        current: 2,
        longest: 4,
      },
      earnedAchievements: ['first_report'],
      recentXPEvents: [
        { label: 'Report submitted', amount: 25, timestamp: new Date().toISOString() },
      ],
    },
  };

  return userData[userId] || {
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 100,
    xpForCurrentLevel: 0,
    reportStats: {
      reported: 0,
      in_progress: 0,
      fixed: 0,
    },
    streak: {
      current: 0,
      longest: 0,
    },
    earnedAchievements: [],
    recentXPEvents: [],
  };
};

export const getMockLeaderboard = (period = 'all') => {
  return [
    {
      userId: 'admin-1',
      displayName: 'Admin User',
      totalXP: 450,
      currentLevel: 3,
      rank: 1,
    },
    {
      userId: 'user-1',
      displayName: 'Test User',
      totalXP: 180,
      currentLevel: 2,
      rank: 2,
    },
    {
      userId: '1',
      displayName: 'John Doe',
      totalXP: 150,
      currentLevel: 2,
      rank: 3,
    },
    {
      userId: '2',
      displayName: 'Jane Smith',
      totalXP: 120,
      currentLevel: 1,
      rank: 4,
    },
    {
      userId: '3',
      displayName: 'Bob Johnson',
      totalXP: 80,
      currentLevel: 1,
      rank: 5,
    },
  ];
};

