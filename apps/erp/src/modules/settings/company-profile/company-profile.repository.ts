import type { PrismaClient } from "../../../generated/prisma";
import type { ICompanyProfileRepository } from "./company-profile.repository.port";
import type { CompanyProfileRecord } from "./company-profile.types";

export class CompanyProfileRepository implements ICompanyProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(companyId: string): Promise<CompanyProfileRecord | null> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) return null;
    return this.mapRecord(company);
  }

  async update(companyId: string, data: Record<string, unknown>): Promise<CompanyProfileRecord> {
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data,
    });
    return this.mapRecord(company);
  }

  private mapRecord(c: {
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
    updatedAt: Date;
  }): CompanyProfileRecord {
    return {
      id: c.id,
      name: c.name,
      gstin: c.gstin,
      phone1: c.phone1,
      phone2: c.phone2,
      email: c.email,
      address: c.address,
      pincode: c.pincode,
      description: c.description,
      signature: c.signature,
      state: c.state,
      businessType: c.businessType,
      businessCategory: c.businessCategory,
      logo: c.logo,
      showOnCard: c.showOnCard,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
