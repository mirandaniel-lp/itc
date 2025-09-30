import { seedRoles } from "./seedRoles.js";
import { seedModalities } from "./seedModalities.js";

async function main() {
  await seedRoles();
  await seedModalities();
  console.log("Seed completo.");
}

main().catch((e) => {
  console.error("Error en seed:", e);
  process.exit(1);
});
