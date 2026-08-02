import type { CompanyProfileDto, UpdateCompanyProfileDto } from "shared";
import type { LoggerPort } from "backend-p";
import type { ICompanyProfileRepository } from "./company-profile.repository.port";
import type { ICompanyProfileService } from "./company-profile.service.port";
import { toCompanyProfileDto } from "./company-profile.mapper";
import { NotFoundError } from "backend-p";

export class CompanyProfileService implements ICompanyProfileService {
  constructor(
    private readonly repo: ICompanyProfileRepository,
    private readonly logger: LoggerPort,
  ) {}

  async getProfile(
    companyId: string,
    userId: string,
  ): Promise<CompanyProfileDto> {
    const [record, membership] = await Promise.all([
      this.repo.findById(companyId),
      this.repo.getMembership(userId, companyId),
    ]);
    if (!record) throw new NotFoundError("Company not found");

    return toCompanyProfileDto(record, membership);
  }

  async updateProfile(
    companyId: string,
    userId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileDto> {
    const [existing, membership] = await Promise.all([
      this.repo.findById(companyId),
      this.repo.getMembership(userId, companyId),
    ]);
    if (!existing) throw new NotFoundError("Company not found");

    const data = this.prepareUpdateData(dto);
    const updated = await this.repo.update(companyId, data);

    this.logger.info(
      { category: "audit", action: "company.profile.updated", companyId },
      "Company profile updated",
    );

    return toCompanyProfileDto(updated, membership);
  }

  private prepareUpdateData(
    dto: UpdateCompanyProfileDto,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const keys: (keyof UpdateCompanyProfileDto)[] = [
      "name",
      "gstin",
      "phone1",
      "phone2",
      "email",
      "address",
      "pincode",
      "description",
      "signature",
      "state",
      "businessType",
      "businessCategory",
      "logo",
      "showOnCard",
    ];
    for (const key of keys) {
      if (key in dto) {
        data[key] = dto[key] === undefined ? null : dto[key];
      }
    }
    return data;
  }
}
