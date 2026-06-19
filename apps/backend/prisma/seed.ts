import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("Seeding database…");

  // Example: upsert a default admin user
  // const admin = await prisma.user.upsert({
  //   where: { email: "admin@syntra.local" },
  //   update: {},
  //   create: {
  //     name: "Admin",
  //     email: "admin@syntra.local",
  //     passwordHash: await hash("changeme123", 12),
  //     role: "ADMIN",
  //   },
  // });
  // console.log("Upserted admin:", admin.email);

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
