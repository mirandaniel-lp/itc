-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EXAMEN', 'PRACTICA', 'TAREA', 'PROYECTO', 'OTRO');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'OTRO';

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "dateofbirth" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Activity_teacherId_idx" ON "Activity"("teacherId");
