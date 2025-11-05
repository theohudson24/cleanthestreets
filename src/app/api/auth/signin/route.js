// API route for sign in
// In a real application, this would authenticate with your backend

// Test accounts for MVP testing
const TEST_ACCOUNTS = {
  'admin@test.com': {
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@test.com',
      displayName: 'Admin User',
      role: 'admin',
    },
  },
  'test@test.com': {
    password: 'test123',
    user: {
      id: 'user-1',
      email: 'test@test.com',
      displayName: 'Test User',
      role: 'user',
    },
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // In a real app, this would:
    // 1. Validate email and password
    // 2. Check user exists in database
    // 3. Verify password hash
    // 4. Create session/token
    // 5. Return user data and token
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Check test accounts for MVP
    const testAccount = TEST_ACCOUNTS[email.toLowerCase()];
    
    if (testAccount && testAccount.password === password) {
      return Response.json({
        user: testAccount.user,
        token: `mock-token-${testAccount.user.id}`,
      });
    }
    
    // For MVP, if not a test account, return error
    // In production, this would check database
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    return Response.json({ error: 'Sign in failed' }, { status: 500 });
  }
}

