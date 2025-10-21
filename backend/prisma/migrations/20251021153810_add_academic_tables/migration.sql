/*
  Warnings:

  - A unique constraint covering the columns `[name,parallel,termId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId,studentId]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Modality` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `programId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MAÑANA', 'TARDE', 'NOCHE');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "weight_pct" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "max_capacity" INTEGER,
ADD COLUMN     "programId" BIGINT NOT NULL,
ADD COLUMN     "shift" "Shift" NOT NULL,
ADD COLUMN     "termId" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "AcademicTerm" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(120),
    "capacity" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentContact" (
    "id" BIGSERIAL NOT NULL,
    "studentId" BIGINT NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "relation" VARCHAR(60) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSchedule" (
    "id" BIGSERIAL NOT NULL,
    "courseId" BIGINT NOT NULL,
    "classroomId" BIGINT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradePolicy" (
    "id" BIGSERIAL NOT NULL,
    "courseId" BIGINT NOT NULL,
    "min_approval_score" DECIMAL(5,2) NOT NULL,
    "min_attendance_pct" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicHoliday" (
    "id" BIGSERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicTerm_start_date_end_date_idx" ON "AcademicTerm"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicTerm_name_key" ON "AcademicTerm"("name");

-- CreateIndex
CREATE INDEX "Program_status_idx" ON "Program"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Program_name_key" ON "Program"("name");

-- CreateIndex
CREATE INDEX "Classroom_status_idx" ON "Classroom"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_code_key" ON "Classroom"("code");

-- CreateIndex
CREATE INDEX "StudentContact_studentId_full_name_idx" ON "StudentContact"("studentId", "full_name");

-- CreateIndex
CREATE INDEX "CourseSchedule_classroomId_weekday_start_time_end_time_idx" ON "CourseSchedule"("classroomId", "weekday", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSchedule_courseId_weekday_start_time_end_time_key" ON "CourseSchedule"("courseId", "weekday", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "GradePolicy_courseId_key" ON "GradePolicy"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicHoliday_date_key" ON "AcademicHoliday"("date");

-- CreateIndex
CREATE INDEX "AcademicHoliday_date_idx" ON "AcademicHoliday"("date");

-- CreateIndex
CREATE INDEX "Activity_courseId_status_idx" ON "Activity"("courseId", "status");

-- CreateIndex
CREATE INDEX "Course_teacherId_idx" ON "Course"("teacherId");

-- CreateIndex
CREATE INDEX "Course_modalityId_idx" ON "Course"("modalityId");

-- CreateIndex
CREATE INDEX "Course_termId_idx" ON "Course"("termId");

-- CreateIndex
CREATE INDEX "Course_programId_idx" ON "Course"("programId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_parallel_termId_key" ON "Course"("name", "parallel", "termId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_status_idx" ON "Enrollment"("courseId", "status");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_status_idx" ON "Enrollment"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "Grade_studentId_idx" ON "Grade"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_activityId_studentId_key" ON "Grade"("activityId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Modality_name_key" ON "Modality"("name");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_ci_idx" ON "Student"("ci");

-- CreateIndex
CREATE INDEX "Teacher_status_idx" ON "Teacher"("status");

-- AddForeignKey
ALTER TABLE "StudentContact" ADD CONSTRAINT "StudentContact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSchedule" ADD CONSTRAINT "CourseSchedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSchedule" ADD CONSTRAINT "CourseSchedule_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradePolicy" ADD CONSTRAINT "GradePolicy_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
