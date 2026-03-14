-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "companyName" TEXT;
ALTER TABLE "tenants" ADD COLUMN "siret" TEXT;
ALTER TABLE "tenants" ADD COLUMN "vatNumber" TEXT;
ALTER TABLE "tenants" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'France';
ALTER TABLE "tenants" ADD COLUMN "phone" TEXT;
ALTER TABLE "tenants" ADD COLUMN "email" TEXT;
ALTER TABLE "tenants" ADD COLUMN "paymentTerms" TEXT;
ALTER TABLE "tenants" ADD COLUMN "quoteValidityDays" INTEGER NOT NULL DEFAULT 30;
