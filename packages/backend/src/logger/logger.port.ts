export type LogPayload = Record<string, unknown>;
export type LogInput = string | LogPayload;

export interface LoggerPort {
  info(input: LogInput, message?: string): void;
  warn(input: LogInput, message?: string): void;
  error(input: LogInput, message?: string): void;
  debug(input: LogInput, message?: string): void;
}
