import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function studentsByCourseBasic(courseId) {
  const cid = BigInt(courseId);
  const rows = await prisma.enrollment.findMany({
    where: { courseId: cid },
    select: {
      student: {
        select: {
          id: true,
          name: true,
          last_name: true,
          second_last_name: true,
          ci: true,
        },
      },
    },
  });
  return rows.map(({ student }) => ({
    id: Number(student.id),
    full_name: `${student.name} ${student.last_name ?? ""} ${
      student.second_last_name ?? ""
    }`.trim(),
    ci: student.ci ?? "",
  }));
}
