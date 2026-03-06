-- AlterTable
ALTER TABLE "actors" ADD COLUMN     "address" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "expectedCloseDate" TIMESTAMP(3),
ADD COLUMN     "probability" INTEGER NOT NULL DEFAULT 0;
