import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedRoles() {
  const roles = [
    { id: 1, name: "ADMINISTRADOR" },
    { id: 2, name: "GERENTE" },
    { id: 3, name: "SECRETARÍA" },
    { id: 4, name: "USUARIO" },
  ];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: role,
    });
  }
}
