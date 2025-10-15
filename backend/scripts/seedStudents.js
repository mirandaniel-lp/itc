import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function r(a) {
  return a[Math.floor(Math.random() * a.length)];
}
function num(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}
function birthdate(minAge = 18, maxAge = 30) {
  const now = new Date();
  const start = new Date(now.getFullYear() - maxAge, 0, 1);
  const end = new Date(now.getFullYear() - minAge, 11, 31);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

async function main() {
  for (let i = 0; i < 50; i++) {
    await prisma.student.create({
      data: {
        name: `Nombre${i + 1}`,
        last_name: `Apellido${i + 1}`,
        second_last_name: `Segundo${i + 1}`,
        ci: num(8),
        image: null,
        dateofbirth: birthdate(),
        placeofbirth: `Ciudad${i + 1}`,
        phone: num(8),
        gender: r(["MASCULINO", "FEMENINO", "OTRO"]),
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
