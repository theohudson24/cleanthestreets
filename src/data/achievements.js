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
  {
    id: 'urban_explorer',
    title: 'Urban Explorer',
    description: 'You\'ve reported hazards in three different neighborhoods.',
    icon: '🧭',
    criteria: 'Report issues in 3 unique neighborhoods',
  },
  {
    id: 'community_builder',
    title: 'Community Builder',
    description: 'You’ve helped validate ten community reports.',
    icon: '🤝',
    criteria: 'Validate 10 reports from other residents',
  },
  {
    id: 'rapid_responder',
    title: 'Rapid Responder',
    description: 'You filed a report within minutes of spotting the hazard.',
    icon: '⚡️',
    criteria: 'Submit a report within 15 minutes of observing an issue',
  },
];

// Helper function to get achievement by ID
export const getAchievementById = (id) => {
  return ACHIEVEMENTS_CATALOG.find(achievement => achievement.id === id);
};
