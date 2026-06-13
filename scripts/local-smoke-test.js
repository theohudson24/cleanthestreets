const baseUrl = process.env.APP_URL || "http://localhost:3000";

function getSetCookieHeaders(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

function updateCookieJar(cookieJar, response) {
  for (const header of getSetCookieHeaders(response)) {
    const [cookie] = header.split(";");
    const [name] = cookie.split("=");
    cookieJar.set(name, cookie);
  }
}

async function getCsrfToken(cookieJar) {
  const response = await fetch(`${baseUrl}/api/auth/csrf`, {
    method: "GET",
    headers: cookieJar.size
      ? { cookie: Array.from(cookieJar.values()).join("; ") }
      : undefined,
    redirect: "manual",
  });

  updateCookieJar(cookieJar, response);
  const data = await response.json();
  return data.csrfToken;
}

async function request(path, options = {}, cookieJar = new Map()) {
  const headers = new Headers(options.headers || {});
  const method = (options.method || "GET").toUpperCase();

  if (cookieJar.size) {
    headers.set("cookie", Array.from(cookieJar.values()).join("; "));
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await getCsrfToken(cookieJar);
    headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    method,
    headers,
    redirect: "manual",
  });

  updateCookieJar(cookieJar, response);

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return { response, data };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async function main() {
  const uniqueEmail = `smoke-${Date.now()}@example.com`;
  const userCookies = new Map();
  const adminCookies = new Map();
  const attackerCookies = new Map();

  console.log(`Running local smoke test against ${baseUrl}`);

  const csrfBootstrap = await request("/api/auth/csrf", {}, userCookies);
  assert(csrfBootstrap.response.ok, "CSRF bootstrap failed");
  console.log("✓ csrf bootstrap");

  const adminCsrfBootstrap = await request("/api/auth/csrf", {}, adminCookies);
  assert(adminCsrfBootstrap.response.ok, "Admin CSRF bootstrap failed");

  const attackerCsrfBootstrap = await request("/api/auth/csrf", {}, attackerCookies);
  assert(attackerCsrfBootstrap.response.ok, "Attacker CSRF bootstrap failed");

  const signup = await request(
    "/api/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "SmokeTest123!",
        displayName: "Smoke Test User",
      }),
    },
    userCookies
  );

  assert(signup.response.status === 201, "Signup failed");
  assert(signup.data.user?.email === uniqueEmail, "Signup user payload missing");
  assert(userCookies.has("cleanthestreets_session"), "Session cookie was not set on signup");
  console.log("✓ signup");

  const session = await request("/api/auth/session", {}, userCookies);
  assert(session.response.ok, "Session lookup failed");
  assert(session.data.user?.email === uniqueEmail, "Session user mismatch");
  console.log("✓ auth session");

  const csrfFailure = await fetch(`${baseUrl}/api/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: Array.from(userCookies.values()).join("; "),
    },
    body: JSON.stringify({
      displayName: "Blocked Update",
      bio: "",
      location: "",
      avatarUrl: "",
    }),
  });
  assert(csrfFailure.status === 403, "CSRF protection should reject missing token");
  console.log("✓ csrf protection");

  const profile = await request("/api/profile", {}, userCookies);
  assert(profile.response.ok, "Profile fetch failed");
  assert(profile.data.email === uniqueEmail, "Profile email mismatch");
  console.log("✓ profile");

  const updatedProfile = await request(
    "/api/profile",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Smoke Test User Updated",
        bio: "Updated via smoke test",
        location: "Los Angeles, CA",
        avatarUrl: "",
        themePreference: "dark",
      }),
    },
    userCookies
  );
  assert(updatedProfile.response.ok, "Profile update failed");
  assert(
    updatedProfile.data.displayName === "Smoke Test User Updated",
    "Profile update did not persist"
  );
  console.log("✓ profile update");

  assert(updatedProfile.data.themePreference === "dark", "Theme preference did not persist");

  const passwordUpdate = await request(
    "/api/profile/password",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "SmokeTest123!",
        newPassword: "SmokeTest456!",
      }),
    },
    userCookies
  );
  assert(passwordUpdate.response.ok, "Password update failed");
  assert(passwordUpdate.data.passwordUpdatedAt, "Password update timestamp missing");
  console.log("password update passed");

  const invalidProfile = await request(
    "/api/profile",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "A",
        bio: "",
        location: "",
        avatarUrl: "",
        themePreference: "light",
      }),
    },
    userCookies
  );
  assert(invalidProfile.response.status === 400, "Profile validation should reject bad data");
  console.log("✓ profile validation");

  const createdReport = await request(
    "/api/reports",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issueType: "pothole",
        description: "Smoke test pothole",
        latitude: 34.0522,
        longitude: -118.2437,
        severity: 2,
        address: "Smoke Test Ave",
      }),
    },
    userCookies
  );
  assert(createdReport.response.status === 201, "Report creation failed");
  assert(
    createdReport.data.user?.id === signup.data.user.id,
    "Created report was not attached to the session user"
  );
  console.log("✓ report creation");

  const invalidReport = await request(
    "/api/reports",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issueType: "pothole",
        description: "Bad coordinates",
        latitude: 400,
        longitude: -118.2437,
      }),
    },
    userCookies
  );
  assert(invalidReport.response.status === 400, "Report validation should reject bad coordinates");
  console.log("✓ report validation");

  const updatedReport = await request(
    `/api/reports/${createdReport.data.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Smoke test pothole updated",
        severity: 3,
      }),
    },
    userCookies
  );
  assert(updatedReport.response.ok, "Report update failed");
  assert(updatedReport.data.severity === 3, "Report severity update did not persist");
  console.log("✓ report update");

  const myReports = await request("/api/me/reports", {}, userCookies);
  assert(myReports.response.ok, "My reports fetch failed");
  assert(Array.isArray(myReports.data), "My reports response is not an array");
  assert(myReports.data.length >= 1, "Expected at least one report for session user");
  console.log("✓ my reports");

  const publicReports = await request("/api/reports?limit=5&page=1&issueType=pothole");
  assert(publicReports.response.ok, "Public report listing failed");
  assert(Array.isArray(publicReports.data.items), "Public reports items missing");
  assert(publicReports.data.pagination?.page === 1, "Pagination payload missing");
  console.log("✓ report list pagination/filtering");

  const leaderboard = await request("/api/leaderboard?period=all");
  assert(leaderboard.response.ok, "Leaderboard fetch failed");
  assert(Array.isArray(leaderboard.data), "Leaderboard response is not an array");
  console.log("✓ leaderboard");

  const adminSignin = await request(
    "/api/auth/signin",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "admin12345",
      }),
    },
    adminCookies
  );
  assert(adminSignin.response.ok, "Admin signin failed");

  const attackerSignup = await request(
    "/api/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `attacker-${Date.now()}@example.com`,
        password: "Attacker123!",
        displayName: "Attacker User",
      }),
    },
    attackerCookies
  );
  assert(attackerSignup.response.status === 201, "Attacker signup failed");

  const forbiddenUpdate = await request(
    `/api/reports/${createdReport.data.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Unauthorized change" }),
    },
    attackerCookies
  );
  assert(forbiddenUpdate.response.status === 403, "Non-owner update should be forbidden");
  console.log("✓ authorization protection");

  const adminStatusUpdate = await request(
    `/api/reports/${createdReport.data.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "fixed" }),
    },
    adminCookies
  );
  assert(adminStatusUpdate.response.ok, "Admin status update failed");
  assert(adminStatusUpdate.data.status === "fixed", "Admin status update did not persist");
  console.log("✓ admin moderation");

  const signout = await request(
    "/api/auth/signout",
    { method: "POST" },
    userCookies
  );
  assert(signout.response.ok, "Signout failed");
  console.log("✓ signout");

  const postSignoutSession = await request("/api/auth/session", {}, userCookies);
  assert(postSignoutSession.data.user === null, "Session should be cleared after signout");
  console.log("✓ session cleared");

  const deleteAfterSignout = await request(
    `/api/reports/${createdReport.data.id}`,
    { method: "DELETE" },
    userCookies
  );
  assert(deleteAfterSignout.response.status === 401, "Signed-out delete should be rejected");
  console.log("✓ ownership protection");

  const rateLimitEmail = `ratelimit-${Date.now()}@example.com`;
  let sawRateLimit = false;
  for (let attempt = 0; attempt < 11; attempt += 1) {
    const limitedResponse = await request(
      "/api/auth/signin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: rateLimitEmail,
          password: "wrongpassword123",
        }),
      },
      attackerCookies
    );

    if (limitedResponse.response.status === 429) {
      sawRateLimit = true;
      break;
    }
  }
  assert(sawRateLimit, "Rate limiting should trigger after repeated signin attempts");
  console.log("✓ rate limiting");

  console.log("Local smoke test passed.");
})().catch((error) => {
  console.error("Local smoke test failed:", error.message);
  process.exit(1);
});
