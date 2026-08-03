import type { PrismaClient } from "../../../generated/prisma";
import { PrismaCrudRepository } from "backend-p";
import type {
  CompanyMembership,
  ICompanyProfileRepository,
} from "./company-profile.repository.port";
import type { CompanyProfileRecord } from "./company-profile.types";

export class CompanyProfileRepository
  extends PrismaCrudRepository<
    CompanyProfileRecord,
    never,
    Record<string, unknown>
  >
  implements ICompanyProfileRepository
{
  constructor(private readonly prisma: PrismaClient) {
    super(prisma.company);
  }

  async getMembership(
    userId: string,
    companyId: string,
  ): Promise<CompanyMembership | null> {
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } },
      select: { role: true, isDefault: true },
    });
    return member;
  }
}
