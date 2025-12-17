import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Construct PrismaClient with default configuration. Connection comes from DATABASE_URL in environment.
if (typeof globalForPrisma.__prisma__ === "undefined") {
  globalForPrisma.__prisma__ = new PrismaClient();
}
const prisma = globalForPrisma.__prisma__;

export default prisma;
