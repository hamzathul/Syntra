export interface TransactionClient {
  readonly id: string;
}

export interface TransactionManager<TClient = TransactionClient> {
  runInTransaction<TResult>(
    operation: (client: TClient) => Promise<TResult>,
  ): Promise<TResult>;
}

export class NoopTransactionManager
  implements TransactionManager<TransactionClient>
{
  async runInTransaction<TResult>(
    operation: (client: TransactionClient) => Promise<TResult>,
  ): Promise<TResult> {
    return operation({ id: "noop-transaction" });
  }
}

export class PrismaTransactionManager
  implements TransactionManager
{
  constructor(
    private readonly prisma: { $transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> },
  ) {}

  async runInTransaction<TResult>(
    operation: (client: TransactionClient) => Promise<TResult>,
  ): Promise<TResult> {
    return this.prisma.$transaction((tx) => operation(tx as TransactionClient));
  }
}
