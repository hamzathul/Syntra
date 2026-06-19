import type { CursorPaginationResult } from "../patterns/strategy/cursor-pagination.strategy";

export abstract class BaseRepository<TEntity, TId = string> {
  abstract findById(id: TId): Promise<TEntity | null>;

  async exists(id: TId): Promise<boolean> {
    return (await this.findById(id)) !== null;
  }
}

/** Standard filter + cursor pagination options passed to findAll. */
export interface ListOptions<TFilter = Record<string, unknown>> {
  readonly filter?: TFilter;
  readonly orderBy?: {
    readonly field: string;
    readonly direction: "asc" | "desc";
  };
  readonly limit?: number;
  readonly cursor?: string;
}

/**
 * Abstract base for repositories that expose the full CRUD surface.
 * Extend this and implement each method against your data store.
 *
 * TEntity  – the shape returned by every method
 * TId      – identifier type (default: string)
 * TCreate  – input for create()
 * TUpdate  – input for update()
 * TFilter  – shape passed to findAll() filter option
 */
export abstract class BaseCrudRepository<
  TEntity,
  TId = string,
  TCreate = unknown,
  TUpdate = unknown,
  TFilter = Record<string, unknown>,
> extends BaseRepository<TEntity, TId> {
  abstract findAll(
    options?: ListOptions<TFilter>,
  ): Promise<CursorPaginationResult<TEntity>>;
  abstract create(data: TCreate): Promise<TEntity>;
  abstract update(id: TId, data: TUpdate): Promise<TEntity>;
  abstract delete(id: TId): Promise<void>;
}
