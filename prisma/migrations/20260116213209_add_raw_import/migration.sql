-- CreateEnum
CREATE TYPE "RawImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "RawImport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" "RawImportStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "recordsCount" INTEGER,
    "accountId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RawImport_userId_idx" ON "RawImport"("userId");

-- CreateIndex
CREATE INDEX "RawImport_status_idx" ON "RawImport"("status");

-- CreateIndex
CREATE INDEX "RawImport_createdAt_idx" ON "RawImport"("createdAt");

-- AddForeignKey
ALTER TABLE "RawImport" ADD CONSTRAINT "RawImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawImport" ADD CONSTRAINT "RawImport_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
