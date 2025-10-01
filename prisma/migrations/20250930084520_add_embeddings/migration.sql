-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "descriptionEmbedding" JSONB;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "content" TEXT,
ADD COLUMN     "contentEmbedding" JSONB;
