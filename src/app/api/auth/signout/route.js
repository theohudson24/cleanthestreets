// API route for sign out
// In a real application, this would invalidate the session/token

export async function POST() {
  try {
    // In a real app, this would:
    // 1. Invalidate the session/token on the server
    // 2. Clear any server-side session data
    
    // For MVP, client-side handles clearing localStorage
    return Response.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    return Response.json({ error: 'Sign out failed' }, { status: 500 });
  }
}

