import { createLogger, type LoggerPort } from "backend-p";
import { env } from "../config/env";

const logger: LoggerPort = createLogger({
  name: "erp",
  level: env.LOG_LEVEL,
  logDir: env.LOG_DIR,
  nodeEnv: env.NODE_ENV,
});

export default logger;
export type { LoggerPort };
