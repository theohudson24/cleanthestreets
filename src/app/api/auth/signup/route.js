import prisma from "@/lib/prisma";
import { createSession, setSessionCookie, toPublicUser } from "@/lib/auth";
import {
  applyRateLimit,
  logSecurityEvent,
  readValidatedJson,
  requireCsrf,
  toErrorResponse,
} from "@/lib/security";
import { signupSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const csrfError = requireCsrf(request);
    if (csrfError) {
      return csrfError;
    }

    const { email, password, displayName } = await readValidatedJson(
      request,
      signupSchema
    );
    const rateLimitResponse = applyRateLimit(request, {
      bucket: "auth:signup",
      identity: `${email}:${request.headers.get("x-forwarded-for") || "local"}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      logSecurityEvent("signup_duplicate_email", request, { email });
      return Response.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json(
      { user: toPublicUser(user) },
      { status: 201 }
    );
    setSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    return toErrorResponse(error, "Sign up failed");
  }
}
