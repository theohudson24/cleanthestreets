import crypto from "crypto";
import { ZodError } from "zod";

export const CSRF_COOKIE_NAME = "cleanthestreets_csrf";

const RATE_LIMIT_STORE =
  globalThis.__cleanthestreetsRateLimitStore ||
  (globalThis.__cleanthestreetsRateLimitStore = new Map());

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getCookieValue(request, name) {
  return request.cookies.get(name)?.value || null;
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "local";
}

function getRequestPath(request) {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "unknown";
  }
}

function redactValue(value) {
  if (typeof value !== "string") return value;
  if (value.length <= 8) return "[redacted]";
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

export function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function setCsrfCookie(response, token = createCsrfToken()) {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return token;
}

export function clearCsrfCookie(response) {
  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
}

export function getCsrfToken(request) {
  return getCookieValue(request, CSRF_COOKIE_NAME);
}

export function logSecurityEvent(type, request, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    type,
    path: getRequestPath(request),
    method: request.method,
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") || "unknown",
    details: Object.fromEntries(
      Object.entries(details).map(([key, value]) => [key, redactValue(value)])
    ),
  };

  console.warn(`[security] ${JSON.stringify(payload)}`);
}

export function jsonError(message, status, extras) {
  return Response.json({ error: message, ...(extras || {}) }, { status });
}

export function serverError(message = "Internal server error") {
  return jsonError(message, 500);
}

export function validationError(message) {
  return jsonError(message, 400);
}

export function forbiddenError(message = "Forbidden") {
  return jsonError(message, 403);
}

export function unauthorizedError(message = "Unauthorized") {
  return jsonError(message, 401);
}

export function tooManyRequestsError(retryAfterSeconds) {
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: retryAfterSeconds
        ? { "Retry-After": String(retryAfterSeconds) }
        : undefined,
    }
  );
}

export async function readValidatedJson(request, schema) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export function parseValidatedSearchParams(request, schema) {
  const url = new URL(request.url);
  const values = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(values);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export function parseValidatedParam(value, schema) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export function toErrorResponse(error, fallbackMessage) {
  if (error instanceof ZodError) {
    return validationError(error.issues[0]?.message || "Invalid request.");
  }

  return serverError(fallbackMessage);
}

export function enforceSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const expectedOrigin = new URL(request.url).origin;
  if (origin === expectedOrigin) return null;

  logSecurityEvent("csrf_origin_mismatch", request, {
    origin,
    expectedOrigin,
  });

  return forbiddenError("Cross-site request blocked.");
}

export function requireCsrf(request) {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const originCheck = enforceSameOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  const csrfCookie = getCsrfToken(request);
  const csrfHeader = request.headers.get("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    logSecurityEvent("csrf_token_mismatch", request, {
      hasCookie: String(Boolean(csrfCookie)),
      hasHeader: String(Boolean(csrfHeader)),
    });
    return forbiddenError("Invalid CSRF token.");
  }

  return null;
}

export function applyRateLimit(request, options) {
  const now = Date.now();
  const identity = options.identity || getClientIp(request);
  const key = `${options.bucket}:${identity}`;

  for (const [entryKey, entry] of RATE_LIMIT_STORE.entries()) {
    if (entry.resetAt <= now) {
      RATE_LIMIT_STORE.delete(entryKey);
    }
  }

  const existing = RATE_LIMIT_STORE.get(key);
  if (!existing || existing.resetAt <= now) {
    RATE_LIMIT_STORE.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  if (existing.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );

    logSecurityEvent("rate_limit_exceeded", request, {
      bucket: options.bucket,
      identity,
      retryAfterSeconds: String(retryAfterSeconds),
    });

    return tooManyRequestsError(retryAfterSeconds);
  }

  existing.count += 1;
  RATE_LIMIT_STORE.set(key, existing);
  return null;
}
