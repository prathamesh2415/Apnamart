-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN "inquiryEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SellerProfile" ADD COLUMN "emailInquiriesEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "showEmailPublicly" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "whatsappBusiness" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SellerProfile" ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "LeadChannel" AS ENUM ('FORM', 'EMAIL', 'WHATSAPP');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "channel" "LeadChannel" NOT NULL DEFAULT 'FORM';

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
