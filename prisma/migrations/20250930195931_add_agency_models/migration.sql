/*
  Warnings:

  - Added the required column `country` to the `ScrapingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `ScrapingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailsFound` to the `ScrapingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newLeadsCount` to the `ScrapingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pagesScraped` to the `ScrapingLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Countries" AS ENUM ('DENMARK', 'GERMANY', 'NETHERLANDS', 'FRANCE');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('AGRICULTURE', 'FORESTRY', 'FOOD_PROCESSING', 'HORTICULTURE', 'LIVESTOCK_FARMING', 'DAIRY_FARMING', 'GREENHOUSES', 'LANDSCAPING', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'CONTACTED', 'INTERESTED', 'ACTIVE', 'INACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PLACED', 'ON_PROBATION', 'CONFIRMED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'OVERDUE', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTING', 'RESPONDED', 'MEETING', 'CONTRACTING', 'CONVERTED', 'LOST', 'UNQUALIFIED');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('RELIABLE', 'UNRELIABLE', 'PAYS_RELOC', 'FAST_HIRING', 'SEASONAL', 'GROWING', 'SHRINKING', 'HIGH_TURNOVER', 'LOW_TURNOVER');

-- AlterTable
ALTER TABLE "ScrapingLog" ADD COLUMN     "country" "Countries" NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "emailsFound" INTEGER NOT NULL,
ADD COLUMN     "industryTrends" TEXT,
ADD COLUMN     "locationTrends" TEXT,
ADD COLUMN     "newLeadsCount" INTEGER NOT NULL,
ADD COLUMN     "pagesScraped" INTEGER NOT NULL,
ADD COLUMN     "successRate" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" "Countries" NOT NULL,
    "industry" "Industry" NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.15,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recruiterId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "country" "Countries" NOT NULL,
    "placementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startSalary" DECIMAL(65,30) NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PLACED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recruiterId" TEXT NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "period" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "country" "Countries" NOT NULL,
    "industry" "Industry" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "contactPerson" TEXT,
    "size" "CompanySize",
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "fitScore" INTEGER,
    "leadType" "LeadType" NOT NULL,
    "sourcedFrom" TEXT,
    "contactedAt" TIMESTAMP(3),
    "firstResponse" TIMESTAMP(3),
    "lastContact" TIMESTAMP(3),
    "openPositions" INTEGER NOT NULL DEFAULT 0,
    "paysRelocation" BOOLEAN NOT NULL DEFAULT false,
    "requiresLanguage" TEXT,
    "visaHelp" BOOLEAN NOT NULL DEFAULT false,
    "housingHelp" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "convertedClientId" TEXT,

    CONSTRAINT "CompanyLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_recruiterId_key" ON "Client"("email", "recruiterId");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_candidateId_jobId_key" ON "Placement"("candidateId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyLead_website_key" ON "CompanyLead"("website");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLead" ADD CONSTRAINT "CompanyLead_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
