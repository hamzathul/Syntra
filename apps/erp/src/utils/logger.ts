import path from "path";
import fs from "fs";
import pino from "pino";
import { PinoLoggerAdapter, type LoggerPort } from "backend-p";
import { env } from "../config/env";

const logDir = path.resolve(env.LOG_DIR);
fs.mkdirSync(logDir, { recursive: true });

const transport = pino.transport({
  targets: [
    ...(env.NODE_ENV !== "production"
      ? [
          {
            target: "pino-pretty",
            options: { colorize: true },
          },
        ]
      : []),
    {
      target: "pino/file",
      level: env.LOG_LEVEL,
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

const pinoLogger = pino({ level: env.LOG_LEVEL }, transport);
const logger = new PinoLoggerAdapter(pinoLogger);

export default logger;
export type { LoggerPort };
