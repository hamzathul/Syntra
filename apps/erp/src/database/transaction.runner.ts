import type { Prisma, PrismaClient } from "../generated/prisma";
import { CompanyRepository } from "../modules/company/company.repository";
import { UnitRepository } from "../modules/items/unit.repository";
import type {
  IRepositorySet,
  ITransactionRunner,
} from "./transaction.runner.port";

export class TransactionRunner implements ITransactionRunner {
  constructor(private readonly prisma: PrismaClient) {}

  async run<T>(work: (repos: IRepositorySet) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const repos = this.buildRepos(tx);
      return work(repos);
    });
  }

  private buildRepos(tx: Prisma.TransactionClient): IRepositorySet {
    return {
      company: new CompanyRepository(tx),
      unit: new UnitRepository(tx),
    };
  }
}
