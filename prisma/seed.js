// CommonJS seed script for use with `node prisma/seed.js`
// Loads .env.local and constructs PrismaClient explicitly to avoid mixed ESM/CJS issues
const dotenv = require("dotenv");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Load .env.local first so it overrides shared .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "test@test.com",
      passwordHash: "changeme",
      displayName: "Test User",
    },
  });

  await prisma.report.create({
    data: {
      issueType: "pothole",
      description: "Seeded pothole",
      latitude: 40.7128,
      longitude: -74.006,
      severity: 2,
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
