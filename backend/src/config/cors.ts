import { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Outside production, the frontend's own Next.js dev server proxies
    // /api/* to this server and forwards the browser's Origin header along
    // with it (see frontend/next.config.ts). That origin varies by how the
    // frontend is being accessed (LAN IP, ngrok tunnel, etc.) but the
    // browser itself never talks to this server directly in that setup, so
    // there's no real cross-origin request to police here -- only
    // production needs the strict allowlist.
    if (!origin || env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
};
