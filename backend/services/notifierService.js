import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function adminRecipientUsers() {
  const rows = await prisma.user.findMany({
    where: {
      status: true,
      role: { name: { in: ["ADMINISTRADOR", "GERENTE"] } },
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
