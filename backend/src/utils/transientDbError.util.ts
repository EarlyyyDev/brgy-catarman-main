import { Prisma } from "@prisma/client";

// Neon's serverless compute suspends after inactivity; the first query (or
// burst of queries) after a gap races its wake-up. This surfaces as one of
// two distinct Prisma error classes depending on exactly when it fails:
//  - PrismaClientInitializationError: the engine couldn't establish a
//    connection at all (a genuinely cold compute) -- always transient here,
//    and notably has NO numeric .code (errorCode is often undefined), so it
//    can only be recognized via instanceof.
//  - PrismaClientKnownRequestError with code P1001 ("can't reach database
//    server") or P2024 (pool exhausted while several queries wait on that
//    same wake-up) -- happens once a connection attempt is underway.
const RETRYABLE_KNOWN_REQUEST_CODES = new Set(["P1001", "P2024"]);

export function isTransientDbError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_KNOWN_REQUEST_CODES.has(err.code);
  }
  return false;
}
