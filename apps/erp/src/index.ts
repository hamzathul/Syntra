import { env } from "./config/env";
import { disconnectPrisma, getPrismaClient } from "./database/prisma.client";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import {
  createGlobalErrorHandler,
  createHealthRouter,
  createRequestLogMiddleware,
  createRequestTimeoutMiddleware,
  notFoundHandler,
  requestIdMiddleware,
  sanitizeRequestBody,
} from "backend-p";
import routes from "./routes";
import logger from "./utils/logger";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      env.CORS_ORIGINS === "*"
        ? "*"
        : env.CORS_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(requestIdMiddleware);
app.use(createRequestTimeoutMiddleware(10_000));
app.use(createRequestLogMiddleware(logger));
app.use(express.json({ limit: "15mb" }));
app.use(sanitizeRequestBody);

app.use(
  createHealthRouter({
    checkDatabase: () => getPrismaClient().$queryRaw`SELECT 1`,
  }),
);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(createGlobalErrorHandler(logger));

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "ERP server started");
});

const shutdown = () => {
  logger.info("Received shutdown signal");
  server.close(async () => {
    await disconnectPrisma();
    logger.info("ERP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
