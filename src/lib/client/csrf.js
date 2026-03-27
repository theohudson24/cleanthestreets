"use client";

const CSRF_COOKIE_NAME = "cleanthestreets_csrf";

function readCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

export async function ensureCsrfToken() {
  const existing = readCookie(CSRF_COOKIE_NAME);
  if (existing) {
    return existing;
  }

  const response = await fetch("/api/auth/csrf", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.csrfToken) {
    throw new Error(data.error || "Failed to initialize secure request token.");
  }

  return data.csrfToken;
}

export async function apiFetch(input, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await ensureCsrfToken();
    headers.set("x-csrf-token", csrfToken);
  }

  return fetch(input, {
    ...init,
    method,
    headers,
    credentials: "same-origin",
  });
}
