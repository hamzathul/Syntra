import type { AxiosInstance } from "axios";
import type { CursorPaginationMeta } from "shared";

export interface PaginatedResult<T> {
  readonly items: T[];
  readonly meta: CursorPaginationMeta;
}

export function createGetUpdate<TGet, TUpdate>(
  api: AxiosInstance,
  path: string,
) {
  return {
    get: (): Promise<TGet> => api.get<TGet>(path).then((r) => r.data),

    update: (dto: TUpdate): Promise<TGet> =>
      api.patch<TGet>(path, dto).then((r) => r.data),
  };
}

export function createListCreate<T>(api: AxiosInstance, path: string) {
  return {
    list: (): Promise<T[]> => api.get<T[]>(path).then((r) => r.data),

    create: (dto: unknown): Promise<T> =>
      api.post<T>(path, dto).then((r) => r.data),
  };
}

export function createCrud<T>(api: AxiosInstance, path: string) {
  return {
    list: (): Promise<T[]> => api.get<T[]>(path).then((r) => r.data),

    create: (dto: unknown): Promise<T> =>
      api.post<T>(path, dto).then((r) => r.data),

    update: (id: string, dto: unknown): Promise<T> =>
      api.patch<T>(`${path}/${id}`, dto).then((r) => r.data),

    remove: (id: string): Promise<void> =>
      api.delete(`${path}/${id}`).then(() => undefined),
  };
}

export function createPaginatedCrud<T>(api: AxiosInstance, path: string) {
  return {
    list: (params?: Record<string, string>): Promise<PaginatedResult<T>> =>
      api.get(path, { params }).then((r) => r.data),

    get: (id: string): Promise<T> =>
      api.get<T>(`${path}/${id}`).then((r) => r.data),

    create: (dto: unknown): Promise<T> =>
      api.post<T>(path, dto).then((r) => r.data),

    update: (id: string, dto: unknown): Promise<T> =>
      api.patch<T>(`${path}/${id}`, dto).then((r) => r.data),

    remove: (id: string): Promise<void> =>
      api.delete(`${path}/${id}`).then(() => undefined),
  };
}
