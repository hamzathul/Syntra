import { getPrismaClient } from "./prisma.client";
import { TransactionRunner } from "./transaction.runner";

let runner: TransactionRunner | null = null;

export function getTransactionRunner(): TransactionRunner {
  if (runner === null) {
    runner = new TransactionRunner(getPrismaClient());
  }
  return runner;
}
