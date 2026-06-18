import type { Logger } from "pino";
import type { LoggerPort, LogInput } from "../../logger/logger.port";

export class PinoLoggerAdapter implements LoggerPort {
  constructor(private readonly logger: Logger) {}

  info(input: LogInput, message?: string): void {
    this.write("info", input, message);
  }

  warn(input: LogInput, message?: string): void {
    this.write("warn", input, message);
  }

  error(input: LogInput, message?: string): void {
    this.write("error", input, message);
  }

  debug(input: LogInput, message?: string): void {
    this.write("debug", input, message);
  }

  private write(
    level: "info" | "warn" | "error" | "debug",
    input: LogInput,
    message?: string,
  ): void {
    if (message === undefined) {
      this.logger[level](input);
      return;
    }

    this.logger[level](input, message);
  }
}
