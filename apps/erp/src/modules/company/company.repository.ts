import type { PrismaClient } from "../../generated/prisma";
import type { ICompanyRepository } from "./company.repository.port";
import type { MemberRole, CompanyWithRole, CreateCompanyInput } from "./company.types";

export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCompanyInput): Promise<CompanyWithRole> {
    const company = await this.prisma.company.create({
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
    const members = await this.prisma.companyMember.findMany({
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
    const count = await this.prisma.companyMember.count({
      where: { userId, companyId },
    });
    return count > 0;
  }

  async getMemberRole(userId: string, companyId: string): Promise<MemberRole | null> {
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    return member ? (member.role as MemberRole) : null;
  }
}
