import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  const { seedDatabase } = await import("../lib/server/store");
  const { prisma } = await import("../lib/db/prisma");

  try {
    await seedDatabase();
    console.log("Database seeded with demo data.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
