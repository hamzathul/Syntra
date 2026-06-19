import type { PrismaClient } from "@prisma/client";
import { BaseRepository } from "backend-p";

interface HealthRecord {
  readonly id: string;
  readonly service: "backend";
  readonly status: "ok" | "degraded";
}

export class HealthRepository extends BaseRepository<HealthRecord, string> {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async findById(id: string): Promise<HealthRecord | null> {
    return id === "backend-health" ? this.getCurrentStatus() : null;
  }

  async getCurrentStatus(): Promise<HealthRecord> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { id: "backend-health", service: "backend", status: "ok" };
    } catch {
      return { id: "backend-health", service: "backend", status: "degraded" };
    }
  }
}
