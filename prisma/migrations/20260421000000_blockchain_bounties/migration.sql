-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING_WALLET', 'READY_TO_PAY', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "walletAddress" TEXT;

-- CreateTable
CREATE TABLE "RepoListing" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "repoGithubId" INTEGER NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "repoDescription" TEXT,
    "bountyAmount" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL DEFAULT 'ETH',
    "chainId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepoListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "maintainerId" TEXT NOT NULL,
    "contributorId" TEXT,
    "contributorGithubId" TEXT NOT NULL,
    "contributorUsername" TEXT NOT NULL,
    "contributorWalletAddress" TEXT,
    "pullRequestNumber" INTEGER NOT NULL,
    "pullRequestTitle" TEXT NOT NULL,
    "pullRequestUrl" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING_WALLET',
    "txHash" TEXT,
    "txError" TEXT,
    "mergedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "RepoListing_repoGithubId_key" ON "RepoListing"("repoGithubId");

-- CreateIndex
CREATE UNIQUE INDEX "RepoListing_repoFullName_key" ON "RepoListing"("repoFullName");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_listingId_pullRequestNumber_key" ON "Payout"("listingId", "pullRequestNumber");

-- AddForeignKey
ALTER TABLE "RepoListing" ADD CONSTRAINT "RepoListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "RepoListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_maintainerId_fkey" FOREIGN KEY ("maintainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
