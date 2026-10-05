import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  RECAPTCHA_SECRET_KEY: z.string().optional(),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN_REMEMBER: z.string().default("30d"),

  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),

  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_ADMIN_NAME: z.string().min(1),

  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(50),
  UPLOAD_DIR: z.string().default("uploads"),

  // Resident-facing transactional email (submission confirmations, status
  // updates). Left optional -- if unset, emails are skipped with a warning
  // log instead of crashing the request that triggered them.
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().default("Barangay Catarman OMS"),

  // AI assistant (public chat widget). Optional -- if unset, the endpoint
  // returns a clear error instead of crashing at startup.
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-flash-latest"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. See errors above.");
}

export const env = parsed.data;
export type Env = typeof env;
