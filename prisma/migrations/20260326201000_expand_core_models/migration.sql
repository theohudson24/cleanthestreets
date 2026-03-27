-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('pothole', 'damaged_road', 'debris', 'signage', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('reported', 'in_progress', 'fixed');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole",
ALTER COLUMN "role" SET DEFAULT 'user';

-- AlterTable
ALTER TABLE "Report"
ALTER COLUMN "issueType" TYPE "IssueType" USING "issueType"::"IssueType",
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "ReportStatus" USING "status"::"ReportStatus",
ALTER COLUMN "status" SET DEFAULT 'reported';

-- CreateIndex
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_issueType_createdAt_idx" ON "Report"("issueType", "createdAt");
