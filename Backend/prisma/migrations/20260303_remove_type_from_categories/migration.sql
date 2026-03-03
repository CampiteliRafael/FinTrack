-- DropIndex
DROP INDEX IF EXISTS "categories_type_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN IF EXISTS "type";
