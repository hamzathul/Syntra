import { BaseRepository } from "backend-p";

interface HealthRecord {
  readonly id: string;
  readonly service: "backend";
  readonly status: "ok" | "degraded";
}

export class HealthRepository extends BaseRepository<HealthRecord, string> {
  private readonly record: HealthRecord = {
    id: "backend-health",
    service: "backend",
    status: "ok",
  };

  async findById(identifier: string): Promise<HealthRecord | null> {
    return identifier === this.record.id ? this.record : null;
  }

  async getCurrentStatus(): Promise<HealthRecord> {
    return this.record;
  }
}
