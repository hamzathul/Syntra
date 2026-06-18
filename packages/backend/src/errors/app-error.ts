import type { ApiErrorDetail } from "shared";

export class AppError extends Error {
  readonly isOperational = true;

  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: readonly ApiErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}
