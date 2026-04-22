-- AlterTable
ALTER TABLE "RepoListing" ADD COLUMN "isDiscoverable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "RepoListing" ADD COLUMN "repoIsPrivate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RepoListing" ADD COLUMN "repoOwnerLogin" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "GitHubAppInstallation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "appSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubAppInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAppInstallation_installationId_key" ON "GitHubAppInstallation"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAppInstallation_userId_installationId_key" ON "GitHubAppInstallation"("userId", "installationId");

-- AddForeignKey
ALTER TABLE "GitHubAppInstallation" ADD CONSTRAINT "GitHubAppInstallation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
