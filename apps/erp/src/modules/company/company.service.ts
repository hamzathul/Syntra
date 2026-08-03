import type { CompanyDto, CreateCompanyDto } from "shared";
import type { LoggerPort } from "backend-p";
import type { ICompanyRepository } from "./company.repository.port";
import type { ICompanyService } from "./company.service.port";
import type { IUnitRepository } from "../items/unit.repository.port";
import { toCompanyDto } from "./company.mapper";

export class CompanyService implements ICompanyService {
  constructor(
    private readonly companyRepo: ICompanyRepository,
    private readonly unitRepo: IUnitRepository,
    private readonly logger: LoggerPort,
  ) {}

  async createCompany(
    dto: CreateCompanyDto,
    userId: string,
  ): Promise<CompanyDto> {
    const company = await this.companyRepo.create({ name: dto.name, userId });

    await this.unitRepo.seedDefaults(company.id);

    this.logger.info(
      {
        category: "audit",
        action: "company.created",
        companyId: company.id,
        userId,
      },
      "Company created",
    );

    return toCompanyDto(company);
  }

  async getUserCompanies(userId: string): Promise<CompanyDto[]> {
    const companies = await this.companyRepo.findByUserId(userId);
    return companies.map(toCompanyDto);
  }
}
