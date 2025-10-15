import { seedRoles } from "./seedRoles.js";
import { seedModalities } from "./seedModalities.js";

async function main() {
  await seedRoles();
  await seedModalities();
}

main().catch((e) => {
  process.exit(1);
});
