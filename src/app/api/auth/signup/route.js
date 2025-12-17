// API route for sign up (demo stub — implement DB-backed user creation and password hashing before production)
// In a real application, this would create a new user account

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    // In a real app, this would:
    // 1. Validate email format
    // 2. Check if email already exists
    // 3. Validate password strength
    // 4. Hash password
    // 5. Create user in database
    // 6. Create session/token
    // 7. Return user data and token

    // For MVP, return success (actual signup would be implemented later)
    if (!email || !password || !displayName) {
      return Response.json(
        { error: "Email, password, and display name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Mock successful sign up
    return Response.json({
      user: {
        id: "1",
        email: email,
        displayName: displayName,
      },
      token: "mock-token",
    });
  } catch (error) {
    return Response.json({ error: "Sign up failed" }, { status: 500 });
  }
}
