import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Sign up route — creates a new user in the database with a hashed password
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    const { passwordHash: _ph, ...safeUser } = user;

    return Response.json(
      { user: safeUser, token: `mock-token-${user.id}` },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: "Sign up failed" }, { status: 500 });
  }
}
