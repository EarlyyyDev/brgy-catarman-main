import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

/**
 * Prisma's default interactive-transaction timeout is 5s, which this Neon
 * compute's cold-start/connection latency (observed at 1-10+s per query
 * during development) can exceed for multi-step transactions (e.g. household
 * membership sync touching several resident rows). Used for every
 * multi-statement $transaction in this codebase.
 */
export const LONG_TRANSACTION_OPTIONS = { timeout: 30_000, maxWait: 15_000 };
