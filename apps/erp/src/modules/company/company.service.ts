import type { CompanyDto, CreateCompanyDto } from "shared";
import type { ICompanyRepository } from "./company.repository.port";
import type { CompanyWithRole } from "./company.types";

export interface ICompanyService {
  createCompany(dto: CreateCompanyDto, userId: string): Promise<CompanyDto>;
  getUserCompanies(userId: string): Promise<CompanyDto[]>;
}

export class CompanyService implements ICompanyService {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async createCompany(dto: CreateCompanyDto, userId: string): Promise<CompanyDto> {
    const company = await this.companyRepo.create({ name: dto.name, userId });
    return this.toDto(company);
  }

  async getUserCompanies(userId: string): Promise<CompanyDto[]> {
    const companies = await this.companyRepo.findByUserId(userId);
    return companies.map((c) => this.toDto(c));
  }

  private toDto(company: CompanyWithRole): CompanyDto {
    return {
      id: company.id,
      name: company.name,
      role: company.role,
      isDefault: company.isDefault,
      createdAt: company.createdAt.toISOString(),
    };
  }
}
