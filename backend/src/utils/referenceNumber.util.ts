import { Prisma, PrismaClient } from "@prisma/client";

type TxClient = Prisma.TransactionClient | PrismaClient;

/**
 * Atomically increments a per-scope counter and returns a zero-padded
 * sequential reference number, e.g. generateReferenceNumber(tx, "BC", 5, 2026)
 * -> "BC-2026-00001". Must be called inside a transaction alongside the
 * insert that consumes the number, so the counter and the record it labels
 * never drift apart under concurrent requests (replacing the frontend
 * prototype's unsafe `array.length + 1` approach).
 */
export async function generateReferenceNumber(
  client: TxClient,
  prefix: string,
  padLength: number,
  year: number = new Date().getFullYear(),
): Promise<string> {
  const scope = `${prefix}-${year}`;

  const counter = await client.referenceNumber.upsert({
    where: { scope },
    create: { scope, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });

  const sequence = counter.lastValue.toString().padStart(padLength, "0");
  return `${scope}-${sequence}`;
}

/**
 * Same idea for scopes that are not year-bucketed (e.g. household numbers
 * keyed by purok rather than year).
 */
export async function generateScopedNumber(
  client: TxClient,
  scope: string,
  padLength: number,
): Promise<string> {
  const counter = await client.referenceNumber.upsert({
    where: { scope },
    create: { scope, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });

  return counter.lastValue.toString().padStart(padLength, "0");
}
