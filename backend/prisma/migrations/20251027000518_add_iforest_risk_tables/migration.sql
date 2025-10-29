-- CreateTable
CREATE TABLE "iforest_models" (
    "id" BIGSERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "features" TEXT,
    "contamination" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iforest_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_predictions" (
    "id" BIGSERIAL NOT NULL,
    "studentId" BIGINT NOT NULL,
    "courseId" BIGINT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "risk01" DOUBLE PRECISION NOT NULL,
    "alert" BOOLEAN NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "contamination" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "iforest_models_version_key" ON "iforest_models"("version");

-- CreateIndex
CREATE UNIQUE INDEX "risk_predictions_studentId_courseId_modelVersion_key" ON "risk_predictions"("studentId", "courseId", "modelVersion");
