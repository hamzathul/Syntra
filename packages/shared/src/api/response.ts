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

export interface ApiErrorResponse {
  readonly status: "error";
  readonly message: string;
  readonly error: ApiErrorPayload;
  readonly meta: ApiResponseMeta;
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
