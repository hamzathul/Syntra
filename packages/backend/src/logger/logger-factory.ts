import path from "path";
import fs from "fs";
import pino from "pino";
import { PinoLoggerAdapter } from "../patterns/adapter/pino-logger.adapter";
import type { LoggerPort } from "./logger.port";

export interface LoggerConfig {
  name: string;
  level: string;
  logDir: string;
  nodeEnv: string;
}

export function createLogger(config: LoggerConfig): LoggerPort {
  const logDir = path.resolve(config.logDir);
  fs.mkdirSync(logDir, { recursive: true });

  const transport = pino.transport({
    targets: [
      ...(config.nodeEnv !== "production"
        ? [
            {
              target: "pino-pretty",
              options: { colorize: true },
            },
          ]
        : []),
      {
        target: "pino/file",
        level: config.level,
        options: { destination: path.join(logDir, "combined.log") },
      },
      {
        target: "pino/file",
        level: "error",
        options: { destination: path.join(logDir, "error.log") },
      },
      {
        target: "pino/file",
        level: "info",
        options: { destination: path.join(logDir, "audit.log") },
      },
    ],
  });

  const pinoLogger = pino(
    { level: config.level, name: config.name },
    transport,
  );

  return new PinoLoggerAdapter(pinoLogger);
}
