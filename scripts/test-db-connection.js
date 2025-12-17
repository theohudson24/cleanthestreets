// node ./scripts/test-db-connection.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Prefer .env.local if present, fallback to .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const { Client } = require("pg");

(async function () {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "DATABASE_URL is not set. Create .env.local with DATABASE_URL or export it to your environment."
    );
    process.exit(1);
  }

  // Parse URL to show which user/host we're trying to connect with (for troubleshooting)
  let dbUser = "(unknown)";
  let dbHost = "(unknown)";
  let dbPort = "(unknown)";
  try {
    const parsed = new URL(databaseUrl);
    dbUser = parsed.username || dbUser;
    dbHost = parsed.hostname || dbHost;
    dbPort = parsed.port || dbPort;
  } catch (err) {
    // ignore parse errors
  }

  console.log(
    `Attempting to connect as user '${dbUser}' to ${dbHost}:${dbPort}`
  );

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const res = await client.query("SELECT 1 as ok, version() as version");
    console.log("✅ Connected to Postgres", res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to connect to Postgres:", err.message);
    console.error(
      "Hints: - Check your DATABASE_URL in .env.local; - Ensure the Docker Postgres container is running (docker compose ps); - Check Postgres logs ('docker compose logs -f db') for authentication errors."
    );
    process.exit(2);
  }
})();
