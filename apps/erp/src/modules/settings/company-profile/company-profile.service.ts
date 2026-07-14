import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";
import type { LoggerPort } from "backend-p";
import type { ICompanyProfileRepository } from "./company-profile.repository.port";
import type { ICompanyProfileService } from "./company-profile.service.port";
import { NotFoundError } from "backend-p";

export class CompanyProfileService implements ICompanyProfileService {
  constructor(
    private readonly repo: ICompanyProfileRepository,
    private readonly logger: LoggerPort,
  ) {}

  async getProfile(companyId: string): Promise<CompanyProfileDto> {
    const record = await this.repo.findById(companyId);
    if (!record) throw new NotFoundError("Company not found");

    return this.toDto(record);
  }

  async updateProfile(companyId: string, dto: UpdateCompanyProfileDto): Promise<CompanyProfileDto> {
    const existing = await this.repo.findById(companyId);
    if (!existing) throw new NotFoundError("Company not found");

    const data = this.prepareUpdateData(dto);
    const updated = await this.repo.update(companyId, data);

    this.logger.info(
      { category: "audit", action: "company.profile.updated", companyId },
      "Company profile updated",
    );

    return this.toDto(updated);
  }

  private toDto(record: {
    id: string;
    name: string;
    gstin: string | null;
    phone1: string | null;
    phone2: string | null;
    email: string | null;
    address: string | null;
    pincode: string | null;
    description: string | null;
    signature: string | null;
    state: string | null;
    businessType: string | null;
    businessCategory: string | null;
    logo: string | null;
    showOnCard: unknown;
    createdAt: Date;
  }): CompanyProfileDto {
    const showOnCard: string[] = Array.isArray(record.showOnCard) ? record.showOnCard : [];
    return {
      id: record.id,
      name: record.name,
      role: "OWNER",
      isDefault: true,
      createdAt: record.createdAt.toISOString(),
      gstin: record.gstin,
      phone1: record.phone1,
      phone2: record.phone2,
      email: record.email,
      address: record.address,
      pincode: record.pincode,
      description: record.description,
      signature: record.signature,
      state: record.state,
      businessType: record.businessType,
      businessCategory: record.businessCategory,
      logo: record.logo,
      showOnCard,
    };
  }

  private prepareUpdateData(dto: UpdateCompanyProfileDto): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const keys: (keyof UpdateCompanyProfileDto)[] = [
      "name", "gstin", "phone1", "phone2", "email", "address", "pincode",
      "description", "signature", "state", "businessType", "businessCategory",
      "logo", "showOnCard",
    ];
    for (const key of keys) {
      if (key in dto) {
        data[key] = dto[key] === undefined ? null : dto[key];
      }
    }
    return data;
  }
}
