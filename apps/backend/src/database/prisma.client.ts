import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

let client: PrismaClient | null = null;
let pool: Pool | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (client === null) {
    pool = new Pool({ connectionString: env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    client = new PrismaClient({ adapter });
  }
  return client;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (client !== null) {
    await client.$disconnect();
    await pool?.end();
    client = null;
    pool = null;
  }
};
