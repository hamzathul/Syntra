import type { CursorPaginationMeta } from "shared";

export interface CursorIdentifiable {
  readonly id: string;
}

export interface CursorPaginationOptions {
  readonly limit: number;
  readonly cursor?: string;
}

export interface CursorPaginationResult<TItem> {
  readonly items: readonly TItem[];
  readonly meta: CursorPaginationMeta;
}

export interface PaginationStrategy<TItem> {
  paginate(
    items: readonly TItem[],
    options: CursorPaginationOptions,
  ): CursorPaginationResult<TItem>;
}

export class CursorPaginationStrategy<TItem extends CursorIdentifiable>
  implements PaginationStrategy<TItem>
{
  paginate(
    items: readonly TItem[],
    options: CursorPaginationOptions,
  ): CursorPaginationResult<TItem> {
    const startIndex =
      options.cursor === undefined
        ? 0
        : Math.max(
            items.findIndex((item) => item.id === options.cursor) + 1,
            0,
          );
    const paginatedItems = items.slice(startIndex, startIndex + options.limit);
    const nextCursor =
      paginatedItems.length === options.limit
        ? paginatedItems[paginatedItems.length - 1]?.id ?? null
        : null;

    return {
      items: paginatedItems,
      meta: {
        nextCursor,
        previousCursor: options.cursor ?? null,
        limit: options.limit,
        hasNextPage: nextCursor !== null,
      },
    };
  }
}
