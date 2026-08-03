import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export interface Disconnectable {
  $disconnect(): Promise<void>;
}

function buildPoolConfig(databaseUrl: string): PoolConfig {
  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get("sslmode") ?? "prefer";
    url.searchParams.delete("sslmode");
    url.searchParams.delete("uselibpqcompat");

    const requireTls =
      sslMode === "require" ||
      sslMode === "verify-ca" ||
      sslMode === "verify-full";

    // verify-full/verify-ca still validate the server cert; require/prefer do not.
    const ssl =
      sslMode === "verify-full" || sslMode === "verify-ca"
        ? { rejectUnauthorized: true }
        : requireTls
          ? { rejectUnauthorized: false }
          : undefined;

    return {
      connectionString: url.toString(),
      ssl,
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
