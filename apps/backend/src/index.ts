import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import logger from "./utils/logger";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use("/api", routes);

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
