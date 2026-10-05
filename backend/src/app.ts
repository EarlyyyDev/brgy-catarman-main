import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { corsOptions } from "./config/cors";
import { csrfMiddleware } from "./middlewares/csrf.middleware";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import routes from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  app.use(csrfMiddleware);

  app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

  app.use("/api", routes);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
