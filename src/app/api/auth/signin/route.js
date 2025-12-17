import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Sign in route — now checks database for users and verifies password hashes
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Omit passwordHash from returned user
    const { passwordHash, ...safeUser } = user;

    return Response.json({ user: safeUser, token: `mock-token-${user.id}` });
  } catch (error) {
    return Response.json({ error: "Sign in failed" }, { status: 500 });
  }
}
