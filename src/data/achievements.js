// Achievement catalog - single source of truth for all achievements
export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first_report',
    title: 'First Report',
    description: 'You submitted your first report!',
    icon: '🎯',
    criteria: 'Submit your first report',
  },
  {
    id: 'on_a_roll',
    title: 'On a Roll',
    description: 'Keep it up! You\'ve reported for three days straight.',
    icon: '🔥',
    criteria: 'Report issues for 3 consecutive days',
  },
  {
    id: 'neighborhood_watch',
    title: 'Neighborhood Watch',
    description: 'You\'ve helped validate five reports in your community.',
    icon: '👀',
    criteria: 'Have 5 reports validated',
  },
  {
    id: 'fix_champion',
    title: 'Fix Champion',
    description: 'Three of your reports have been fixed!',
    icon: '🏆',
    criteria: 'Have 3 reports marked as fixed',
  },
  {
    id: 'photographer',
    title: 'Photographer',
    description: 'You\'ve submitted ten reports with photos.',
    icon: '📸',
    criteria: 'Submit 10 reports with photos',
  },
];

// Helper function to get achievement by ID
export const getAchievementById = (id) => {
  return ACHIEVEMENTS_CATALOG.find(achievement => achievement.id === id);
};

