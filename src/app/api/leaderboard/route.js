// API route for leaderboard
// In a real application, this would aggregate data from the database

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    
    // In a real app, this would:
    // 1. Query database for users with reports
    // 2. Group by userId
    // 3. Count reports per user
    // 4. Filter by time period if needed
    // 5. Sort by count descending
    // 6. Limit to top N
    
    // For MVP, return mock data
    // Include test accounts for testing
    const leaderboard = [
      {
        userId: 'admin-1',
        displayName: 'Admin User',
        totalReports: 25,
        city: 'New York',
        avatar: null,
      },
      {
        userId: 'user-1',
        displayName: 'Test User',
        totalReports: 18,
        city: 'Los Angeles',
        avatar: null,
      },
      {
        userId: '1',
        displayName: 'John Doe',
        totalReports: 15,
        city: 'New York',
        avatar: null,
      },
      {
        userId: '2',
        displayName: 'Jane Smith',
        totalReports: 12,
        city: 'Los Angeles',
        avatar: null,
      },
      {
        userId: '3',
        displayName: 'Bob Johnson',
        totalReports: 8,
        city: 'Chicago',
        avatar: null,
      },
    ];
    
    return Response.json(leaderboard);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

