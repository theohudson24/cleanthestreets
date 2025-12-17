const dotenv = require("dotenv");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Load local env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

(async () => {
  const prisma = new PrismaClient();
  try {
    const u = await prisma.user.findUnique({
      where: { email: "test@test.com" },
    });
    if (!u) {
      console.error("user not found");
      process.exit(2);
    }
    console.log("user found: id=" + u.id + ", email=" + u.email);
    console.log(
      "password valid?",
      bcrypt.compareSync("changeme", u.passwordHash)
    );
  } catch (err) {
    console.error("error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
