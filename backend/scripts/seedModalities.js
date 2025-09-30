import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedModalities() {
  const modalities = [
    { id: 1, name: "ANUAL", duration_in_months: 12 },
    { id: 2, name: "MODULAR", duration_in_months: 3 },
  ];

  for (const modality of modalities) {
    await prisma.modality.upsert({
      where: { id: modality.id },
      update: {},
      create: modality,
    });
  }

  console.log("Modalidades creadas.");
}
