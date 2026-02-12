-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'INGESTING', 'SPLITTING', 'CLASSIFYING', 'FINALIZING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SegmentStatus" AS ENUM ('PENDING', 'CLASSIFYING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentBucket" AS ENUM ('INCOME', 'ASSETS', 'TAX_RETURNS', 'PROPERTY', 'CREDIT', 'IDENTITY', 'DISCLOSURES', 'BUSINESS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_jobs" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "userId" TEXT,
    "sourceFileKey" TEXT NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "sourceSizeBytes" INTEGER,
    "totalPages" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "triggerRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "classification_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_segments" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "segmentIndex" INTEGER NOT NULL,
    "pageStart" INTEGER NOT NULL,
    "pageEnd" INTEGER NOT NULL,
    "bucket" "DocumentBucket",
    "bucketConfidence" DOUBLE PRECISION,
    "subtype" TEXT,
    "confidence" DOUBLE PRECISION,
    "reasoning" TEXT,
    "status" "SegmentStatus" NOT NULL DEFAULT 'PENDING',
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "confidenceLevel" "ConfidenceLevel",
    "manuallyClassified" BOOLEAN NOT NULL DEFAULT false,
    "classifiedBy" TEXT,
    "classifiedAt" TIMESTAMP(3),
    "originalBucket" "DocumentBucket",
    "originalSubtype" TEXT,
    "outputFileKey" TEXT,
    "suggestedFilename" TEXT,
    "encompassFolder" TEXT,
    "triggerRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classificationStartedAt" TIMESTAMP(3),
    "classificationCompletedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "errorCode" TEXT,

    CONSTRAINT "classification_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "classification_jobs_status_idx" ON "classification_jobs"("status");

-- CreateIndex
CREATE INDEX "classification_jobs_loanId_idx" ON "classification_jobs"("loanId");

-- CreateIndex
CREATE INDEX "classification_jobs_userId_idx" ON "classification_jobs"("userId");

-- CreateIndex
CREATE INDEX "classification_jobs_createdAt_idx" ON "classification_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "classification_segments_jobId_idx" ON "classification_segments"("jobId");

-- CreateIndex
CREATE INDEX "classification_segments_status_idx" ON "classification_segments"("status");

-- CreateIndex
CREATE INDEX "classification_segments_bucket_idx" ON "classification_segments"("bucket");

-- CreateIndex
CREATE INDEX "classification_segments_requiresReview_idx" ON "classification_segments"("requiresReview");

-- CreateIndex
CREATE UNIQUE INDEX "classification_segments_jobId_segmentIndex_key" ON "classification_segments"("jobId", "segmentIndex");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- AddForeignKey
ALTER TABLE "classification_jobs" ADD CONSTRAINT "classification_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_segments" ADD CONSTRAINT "classification_segments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "classification_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
