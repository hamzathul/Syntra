import type { LoggerPort } from "../../logger/logger.port";

export const withErrorLogging = <TResult>(
  operationName: string,
  logger: LoggerPort,
  operation: () => Promise<TResult>,
): Promise<TResult> =>
  operation().catch((error: unknown) => {
    logger.error(
      { operationName, error },
      "Decorated operation failed",
    );
    throw error;
  });
