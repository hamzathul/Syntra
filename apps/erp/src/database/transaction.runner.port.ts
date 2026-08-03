import type { ICompanyRepository } from "../modules/company/company.repository.port";
import type { IUnitRepository } from "../modules/items/unit.repository.port";

export interface IRepositorySet {
  company: ICompanyRepository;
  unit: IUnitRepository;
}

export interface ITransactionRunner {
  run<T>(work: (repos: IRepositorySet) => Promise<T>): Promise<T>;
}
