import pino from "pino";
import { PinoLoggerAdapter } from "backend-p";
import { env } from "../config/env";

const pinoLogger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  }),
});

export default new PinoLoggerAdapter(pinoLogger);
