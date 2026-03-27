// CommonJS seed script for use with `node prisma/seed.js`
// Loads .env.local and constructs PrismaClient explicitly to avoid mixed ESM/CJS issues
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

// Load .env.local first so it overrides shared .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Ensure the test users exist and passwords are set (idempotent)
  await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {
      passwordHash: bcrypt.hashSync("test12345", 10),
      displayName: "Test User",
      bio: "Neighborhood issue reporter",
      location: "Los Angeles, CA",
    },
    create: {
      email: "test@test.com",
      passwordHash: bcrypt.hashSync("test12345", 10),
      displayName: "Test User",
      bio: "Neighborhood issue reporter",
      location: "Los Angeles, CA",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      passwordHash: bcrypt.hashSync("admin12345", 10),
      displayName: "Admin User",
      role: "admin",
      bio: "Community moderation account",
      location: "New York, NY",
    },
    create: {
      email: "admin@test.com",
      passwordHash: bcrypt.hashSync("admin12345", 10),
      displayName: "Admin User",
      role: "admin",
      bio: "Community moderation account",
      location: "New York, NY",
    },
  });

  // Create a sample report if one with the same description doesn't already exist
  const existingReport = await prisma.report.findFirst({
    where: { description: "Seeded pothole" },
  });
  if (!existingReport) {
    const testUser = await prisma.user.findUnique({
      where: { email: "test@test.com" },
      select: { id: true },
    });

    await prisma.report.create({
      data: {
        userId: testUser?.id,
        issueType: "pothole",
        description: "Seeded pothole",
        latitude: 40.7128,
        longitude: -74.006,
        severity: 2,
      },
    });
  }

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
