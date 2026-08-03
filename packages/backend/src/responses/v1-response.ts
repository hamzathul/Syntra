import type { Request, Response } from "express";
import {
  DEFAULT_API_VERSION,
  type ApiErrorDebug,
  type ApiErrorDetail,
  type ApiErrorResponse,
  type ApiResponseMeta,
  type ApiSuccessResponse,
  type CursorPaginationMeta,
} from "shared";

interface SuccessOptions<TData> {
  readonly request: Request;
  readonly statusCode?: number;
  readonly message: string;
  readonly data: TData;
  readonly pagination?: CursorPaginationMeta;
}

interface ErrorOptions {
  readonly request: Request;
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly details?: readonly ApiErrorDetail[];
  readonly debug?: ApiErrorDebug;
}

export class V1Response {
  private static instance: V1Response | null = null;

  private constructor() {}

  static getInstance(): V1Response {
    if (V1Response.instance === null) {
      V1Response.instance = new V1Response();
    }

    return V1Response.instance;
  }

  success<TData>(
    response: Response<ApiSuccessResponse<TData>>,
    options: SuccessOptions<TData>,
  ): void {
    response.status(options.statusCode ?? 200).json({
      status: "success",
      message: options.message,
      data: options.data,
      meta: this.createMeta(options.request, options.pagination),
    });
  }

  error(response: Response<ApiErrorResponse>, options: ErrorOptions): void {
    const isProduction = process.env["NODE_ENV"] === "production";
    response.status(options.statusCode).json({
      status: "error",
      message: options.message,
      error: {
        code: options.code,
        details: options.details,
      },
      meta: this.createMeta(options.request),
      ...(options.debug !== undefined &&
        !isProduction && { debug: options.debug }),
    });
  }

  private createMeta(
    request: Request,
    pagination?: CursorPaginationMeta,
  ): ApiResponseMeta {
    return {
      requestId: request.header("x-request-id"),
      timestamp: new Date().toISOString(),
      version: DEFAULT_API_VERSION,
      pagination,
    };
  }
}
