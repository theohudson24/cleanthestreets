-- AlterTable
ALTER TABLE "ReportImage"
ADD COLUMN "publicId" TEXT,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "format" TEXT,
ADD COLUMN "bytes" INTEGER;
