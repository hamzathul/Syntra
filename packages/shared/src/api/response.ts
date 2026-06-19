import type { ApiVersion } from "./api-version";

export type ApiResponseStatus = "success" | "error";

export interface CursorPaginationMeta {
  readonly nextCursor: string | null;
  readonly previousCursor?: string | null;
  readonly limit: number;
  readonly hasNextPage: boolean;
}

export interface ApiResponseMeta {
  readonly requestId?: string;
  readonly timestamp: string;
  readonly version: ApiVersion;
  readonly pagination?: CursorPaginationMeta;
}

export interface ApiSuccessResponse<TData> {
  readonly status: "success";
  readonly message: string;
  readonly data: TData;
  readonly meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface ApiErrorPayload {
  readonly code: string;
  readonly details?: readonly ApiErrorDetail[];
}

/** Included in error responses only when NODE_ENV !== "production". */
export interface ApiErrorDebug {
  /** Original error class name (e.g. "TypeError", "ConflictError"). */
  readonly name: string;
  /** Parsed stack frames — file path, line, column, function name. */
  readonly stack: readonly {
    readonly fn: string;
    readonly file: string;
    readonly line: number;
    readonly col: number;
  }[];
}

export interface ApiErrorResponse {
  readonly status: "error";
  readonly message: string;
  readonly error: ApiErrorPayload;
  readonly meta: ApiResponseMeta;
  /** Only present outside production. */
  readonly debug?: ApiErrorDebug;
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
