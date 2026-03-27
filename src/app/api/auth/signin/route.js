import prisma from "@/lib/prisma";
import { createSession, setSessionCookie, toPublicUser } from "@/lib/auth";
import {
  applyRateLimit,
  logSecurityEvent,
  readValidatedJson,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";
import { signinSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const csrfError = requireCsrf(request);
    if (csrfError) {
      return csrfError;
    }

    const { email, password } = await readValidatedJson(request, signinSchema);
    const rateLimitResponse = applyRateLimit(request, {
      bucket: "auth:signin",
      identity: `${email}:${request.headers.get("x-forwarded-for") || "local"}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logSecurityEvent("signin_failed", request, { email, reason: "user_not_found" });
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      logSecurityEvent("signin_failed", request, { email, reason: "bad_password" });
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json({ user: toPublicUser(user) });
    setSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    return toErrorResponse(error, "Sign in failed");
  }
}
