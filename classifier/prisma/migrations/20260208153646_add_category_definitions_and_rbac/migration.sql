-- CreateEnum
CREATE TYPE "DefinitionVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "classification_jobs" ADD COLUMN     "definitionVersionId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "category_definition_versions" (
    "id" TEXT NOT NULL,
    "version" SERIAL NOT NULL,
    "status" "DefinitionVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "publishedById" TEXT,

    CONSTRAINT "category_definition_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_definitions" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "category_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtype_definitions" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "encompassFolder" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "subtype_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_definition_versions_version_key" ON "category_definition_versions"("version");

-- CreateIndex
CREATE INDEX "category_definition_versions_status_idx" ON "category_definition_versions"("status");

-- CreateIndex
CREATE INDEX "category_definitions_versionId_idx" ON "category_definitions"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "category_definitions_versionId_name_key" ON "category_definitions"("versionId", "name");

-- CreateIndex
CREATE INDEX "subtype_definitions_categoryId_idx" ON "subtype_definitions"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "subtype_definitions_categoryId_type_key" ON "subtype_definitions"("categoryId", "type");

-- AddForeignKey
ALTER TABLE "classification_jobs" ADD CONSTRAINT "classification_jobs_definitionVersionId_fkey" FOREIGN KEY ("definitionVersionId") REFERENCES "category_definition_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_definition_versions" ADD CONSTRAINT "category_definition_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_definition_versions" ADD CONSTRAINT "category_definition_versions_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_definitions" ADD CONSTRAINT "category_definitions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "category_definition_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtype_definitions" ADD CONSTRAINT "subtype_definitions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
