import crypto from "crypto";

/** Generates a URL-safe random raw token (e.g. for password reset / refresh tokens). */
export function generateRawToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Deterministic one-way hash used to store tokens at rest — raw values are never persisted. */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
