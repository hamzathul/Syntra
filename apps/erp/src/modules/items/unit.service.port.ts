import type { CreateUnitDto, UnitDto, UpdateUnitDto } from "shared";

export interface IUnitService {
  list(companyId: string): Promise<UnitDto[]>;
  create(companyId: string, dto: CreateUnitDto): Promise<UnitDto>;
  update(id: string, companyId: string, dto: UpdateUnitDto): Promise<UnitDto>;
  remove(id: string, companyId: string): Promise<void>;
  seedDefaults(companyId: string): Promise<void>;
}
