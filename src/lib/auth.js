import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  clearCsrfCookie,
  setCsrfCookie,
  shouldUseSecureCookies,
  unauthorizedError,
} from "@/lib/security";

export const SESSION_COOKIE_NAME = "cleanthestreets_session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function getCookieStore(request) {
  return request?.cookies ?? (await cookies());
}

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      sessionTokenHash: hashSessionToken(token),
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getCurrentSession(request) {
  const token = (await getCookieStore(request)).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await prisma.session
      .delete({ where: { sessionTokenHash: session.sessionTokenHash } })
      .catch(() => {});
    return null;
  }

  return session;
}

export async function getCurrentUser(request) {
  const session = await getCurrentSession(request);
  return session?.user ?? null;
}

export async function requireUser(request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      user: null,
      response: unauthorizedError(),
    };
  }

  return { user, response: null };
}

export function isAdmin(user) {
  return user?.role === "admin";
}

export async function invalidateSession(request) {
  const token = (await getCookieStore(request)).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return;

  await prisma.session
    .delete({ where: { sessionTokenHash: hashSessionToken(token) } })
    .catch(() => {});
}

export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    expires: expiresAt,
    path: "/",
    priority: "high",
  });

  setCsrfCookie(response);
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    expires: new Date(0),
    path: "/",
    priority: "high",
  });

  clearCsrfCookie(response);
}
