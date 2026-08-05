import type { DbClient } from "../../database/db-client";
import type { ICompanyRepository } from "./company.repository.port";
import type {
  CompanyWithRole,
  CreateCompanyInput,
  MemberRole,
} from "./company.types";

export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateCompanyInput): Promise<CompanyWithRole> {
    const company = await this.db.company.create({
      data: {
        name: input.name,
        members: {
          create: { userId: input.userId, role: "OWNER", isDefault: true },
        },
      },
      include: { members: { where: { userId: input.userId } } },
    });

    const member = company.members[0]!;
    return {
      id: company.id,
      name: company.name,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      role: member.role as MemberRole,
      isDefault: member.isDefault,
    };
  }

  async findByUserId(userId: string): Promise<CompanyWithRole[]> {
    const members = await this.db.companyMember.findMany({
      where: { userId },
      include: { company: true },
      orderBy: { joinedAt: "asc" },
    });

    return members.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      createdAt: m.company.createdAt,
      updatedAt: m.company.updatedAt,
      role: m.role as MemberRole,
      isDefault: m.isDefault,
    }));
  }

  async isMember(userId: string, companyId: string): Promise<boolean> {
    const count = await this.db.companyMember.count({
      where: { userId, companyId },
    });
    return count > 0;
  }
}
