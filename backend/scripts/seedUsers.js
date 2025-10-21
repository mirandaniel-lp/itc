import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export async function seedUsers() {
  const roles = await prisma.role.findMany();
  const adminRole = roles.find((r) => r.name === "ADMINISTRADOR");
  const gerenteRole = roles.find((r) => r.name === "GERENTE");
  const secretariaRole = roles.find((r) => r.name === "SECRETARÍA");
  const usuarioRole = roles.find((r) => r.name === "USUARIO");

  const users = [
    { email: "admin@itc.edu", password: "admin123", roleId: adminRole?.id },
    {
      email: "gerente@itc.edu",
      password: "gerente123",
      roleId: gerenteRole?.id,
    },
    {
      email: "secretaria@itc.edu",
      password: "secretaria123",
      roleId: secretariaRole?.id,
    },
    {
      email: "usuario@itc.edu",
      password: "usuario123",
      roleId: usuarioRole?.id,
    },
  ];

  for (const u of users) {
    if (!u.roleId) continue;
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed, roleId: u.roleId, status: true },
      create: {
        email: u.email,
        password: hashed,
        roleId: u.roleId,
        status: true,
      },
    });
  }
}

if (process.argv[1].includes("seedUsers.js")) {
  seedUsers().finally(async () => {
    await prisma.$disconnect();
  });
}
