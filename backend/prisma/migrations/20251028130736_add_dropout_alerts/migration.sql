-- CreateTable
CREATE TABLE "DropoutAlert" (
    "id" BIGSERIAL NOT NULL,
    "studentId" BIGINT NOT NULL,
    "courseId" BIGINT NOT NULL,
    "risk01" DOUBLE PRECISION NOT NULL,
    "alert" BOOLEAN NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "contamination" DOUBLE PRECISION NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "message" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DropoutAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DropoutAlert_studentId_courseId_createdAt_idx" ON "DropoutAlert"("studentId", "courseId", "createdAt");

-- AddForeignKey
ALTER TABLE "DropoutAlert" ADD CONSTRAINT "DropoutAlert_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropoutAlert" ADD CONSTRAINT "DropoutAlert_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
