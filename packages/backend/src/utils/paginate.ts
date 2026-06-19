import type { CursorPaginationResult } from "../patterns/strategy/cursor-pagination.strategy";

interface WithId {
  readonly id: string;
}

/**
 * Converts an over-fetched result (fetched with take = limit + 1) into a
 * cursor-paginated result. ORM-agnostic — works with any array.
 */
export function paginateResult<TItem extends WithId>(
  rawItems: TItem[],
  limit: number,
  cursor?: string,
): CursorPaginationResult<TItem> {
  const hasNextPage = rawItems.length > limit;
  const items = hasNextPage ? rawItems.slice(0, limit) : rawItems;
  return {
    items,
    meta: {
      nextCursor: hasNextPage ? (items[items.length - 1]?.id ?? null) : null,
      previousCursor: cursor ?? null,
      limit,
      hasNextPage,
    },
  };
}
