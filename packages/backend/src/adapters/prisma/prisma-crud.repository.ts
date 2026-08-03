import {
  BaseCrudRepository,
  type ListOptions,
} from "../../abstractions/base.repository";
import {
  paginateResult,
  type CursorPaginationResult,
} from "../../utils/paginate";

// Prisma's per-model delegate types are deeply generated generics. We describe
// only the five methods we call, using `unknown` for args/return so any Prisma
// delegate satisfies this structurally. The class generics below carry the real
// types outward — callers never see `unknown`.
interface PrismaDelegate {
  findUnique(args: unknown): Promise<unknown>;
  findMany(args?: unknown): Promise<unknown[]>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
}

function buildFindManyArgs(options?: { limit?: number; cursor?: string }) {
  const limit = options?.limit ?? 20;
  return {
    take: limit + 1,
    ...(options?.cursor !== undefined
      ? { cursor: { id: options.cursor }, skip: 1 }
      : {}),
  };
}

/**
 * Prisma-specific CRUD base for standard full-CRUD entities (entity has a
 * plain `id`, created/updated timestamps, and no company scoping).
 *
 * NOT for every repository: repos with company-scoped queries, nested
 * relations, or non-CRUD operations (e.g. taxes, companies, refresh tokens)
 * should implement their port directly instead.
 *
 * To swap to another ORM, create a parallel file (e.g. typeorm-crud.repository.ts)
 * with the same abstract class signature — nothing outside this infrastructure
 * directory needs to change.
 *
 * @example
 * export class ItemRepository
 *   extends PrismaCrudRepository<Item, CreateItem, UpdateItem>
 *   implements IItemRepository
 * {
 *   constructor(private readonly prisma: PrismaClient) { super(prisma.item); }
 *
 *   findBySku(sku: string) {
 *     return this.prisma.item.findUnique({ where: { sku } });
 *   }
 * }
 */
export abstract class PrismaCrudRepository<
  TEntity extends { id: string },
  TCreate,
  TUpdate,
  TFilter = Record<string, unknown>,
> extends BaseCrudRepository<TEntity, string, TCreate, TUpdate, TFilter> {
  constructor(private readonly model: PrismaDelegate) {
    super();
  }

  async findById(id: string): Promise<TEntity | null> {
    return this.model.findUnique({ where: { id } }) as Promise<TEntity | null>;
  }

  async findAll(
    options?: ListOptions<TFilter>,
  ): Promise<CursorPaginationResult<TEntity>> {
    const limit = options?.limit ?? 20;
    const rows = (await this.model.findMany({
      where: options?.filter,
      orderBy: { createdAt: "desc" },
      ...buildFindManyArgs(options),
    })) as TEntity[];
    return paginateResult(rows, limit, options?.cursor);
  }

  async create(data: TCreate): Promise<TEntity> {
    return this.model.create({ data }) as Promise<TEntity>;
  }

  async update(id: string, data: TUpdate): Promise<TEntity> {
    return this.model.update({ where: { id }, data }) as Promise<TEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}
