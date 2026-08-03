import { PrismaClient } from "../generated/prisma";
import { createPrismaClient } from "backend-p";
import { env } from "../config/env";

export const { getClient: getPrismaClient, disconnect: disconnectPrisma } =
  createPrismaClient(PrismaClient, env.DATABASE_URL);
