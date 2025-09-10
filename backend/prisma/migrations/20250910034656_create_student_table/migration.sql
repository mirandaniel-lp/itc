-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" BIGSERIAL NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "second_last_name" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "ci" VARCHAR(15),
    "image" VARCHAR(255),
    "dateofbirth" TIMESTAMP(3) NOT NULL,
    "placeofbirth" VARCHAR(200),
    "phone" VARCHAR(10) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);
