import pino from "pino";
import { PinoLoggerAdapter } from "backend-p";

const pinoLogger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const logger = new PinoLoggerAdapter(pinoLogger);

export default logger;
