import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export interface Disconnectable {
  $disconnect(): Promise<void>;
}

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

export function createPrismaClient<TClient extends Disconnectable>(
  ClientCtor: new (opts: { adapter: PrismaPg }) => TClient,
  databaseUrl: string,
  configure?: (client: TClient) => void,
): { getClient: () => TClient; disconnect: () => Promise<void> } {
  let client: TClient | null = null;
  let pool: Pool | null = null;

  const getClient = (): TClient => {
    if (client === null) {
      pool = new Pool(buildPoolConfig(databaseUrl));
      const adapter = new PrismaPg(pool);
      client = new ClientCtor({ adapter });
      configure?.(client);
    }
    return client;
  };

  const disconnect = async (): Promise<void> => {
    if (client !== null) {
      await client.$disconnect();
      await pool?.end();
      client = null;
      pool = null;
    }
  };

  return { getClient, disconnect };
}
