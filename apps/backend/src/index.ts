import cors from "cors";
import express, { type Express } from "express";
import dotenv from "dotenv";
import {
  createGlobalErrorHandler,
  notFoundHandler,
  requestIdMiddleware,
  sanitizeRequestBody,
} from "backend-p";
import routes from "./routes";
import logger from "./utils/logger";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(requestIdMiddleware);
app.use(express.json());
app.use(sanitizeRequestBody);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(createGlobalErrorHandler(logger));

app.listen(port, () => {
  logger.info(
    { port },
    `[server]: Server is running at http://localhost:${port}`,
  );
});
