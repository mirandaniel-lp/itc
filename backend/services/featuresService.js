import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function featuresByCourse(courseId) {
  const cid = BigInt(courseId);
  return prisma.$queryRawUnsafe(
    `SELECT * FROM vw_iforest_features WHERE course_id = $1`,
    cid
  );
}

export async function featuresAll() {
  return prisma.$queryRawUnsafe(`SELECT * FROM vw_iforest_features`);
}

export async function activeCourseIds() {
  const rows = await prisma.course.findMany({
    where: { status: true, term: { status: true } },
    select: { id: true },
  });
  return rows.map((r) => Number(r.id));
}
