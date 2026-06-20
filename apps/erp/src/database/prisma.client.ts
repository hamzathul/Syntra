import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { env } from "../config/env";

function buildPoolConfig(databaseUrl: string): PoolConfig {
  try {
    const url = new URL(databaseUrl);
    const hasSsl = url.searchParams.has("sslmode");
    url.searchParams.delete("sslmode");
    url.searchParams.delete("uselibpqcompat");
    return {
      connectionString: url.toString(),
      ssl: hasSsl ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    return { connectionString: databaseUrl };
  }
}

let client: PrismaClient | null = null;
let pool: Pool | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (client === null) {
    pool = new Pool(buildPoolConfig(env.DATABASE_URL));
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
