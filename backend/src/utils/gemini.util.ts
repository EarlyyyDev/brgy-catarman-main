import { env } from "../config/env";
import { ApiError } from "./apiError.util";
import { logger } from "./logger.util";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];
const DEFAULT_QUOTA_COOLDOWN_MS = 60_000;
const MAX_QUOTA_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const keyCooldowns = new Map<string, number>();

function getApiKeys(): string[] {
  return [...new Set([...(env.GEMINI_API_KEYS ?? "").split(/[,\r\n]+/), env.GEMINI_API_KEY ?? ""].map((key) => key.trim()).filter(Boolean))];
}

function getAvailableKeys(keys: string[]): string[] {
  const now = Date.now();
  for (const [key, expiresAt] of keyCooldowns) {
    if (expiresAt <= now) keyCooldowns.delete(key);
  }
  return keys.filter((key) => !keyCooldowns.has(key));
}

function quotaCooldownMs(response: Response, body: string): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, 1000), MAX_QUOTA_COOLDOWN_MS);
    const retryDate = Date.parse(retryAfter);
    if (Number.isFinite(retryDate)) return Math.min(Math.max(retryDate - Date.now(), 1000), MAX_QUOTA_COOLDOWN_MS);
  }

  const retryText = body.match(/retry in\s+((?:\d+h)?(?:\d+m)?(?:\d+(?:\.\d+)?s)?)/i)?.[1];
  if (!retryText) return DEFAULT_QUOTA_COOLDOWN_MS;
  const hours = Number(retryText.match(/(\d+(?:\.\d+)?)h/i)?.[1] ?? 0);
  const minutes = Number(retryText.match(/(\d+(?:\.\d+)?)m/i)?.[1] ?? 0);
  const seconds = Number(retryText.match(/(\d+(?:\.\d+)?)s/i)?.[1] ?? 0);
  const cooldown = (hours * 3600 + minutes * 60 + seconds) * 1000;
  return Math.min(Math.max(cooldown, 1000), MAX_QUOTA_COOLDOWN_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildContents(message: string, history: ChatTurn[]) {
  return [
    ...history.slice(-6).map((turn) => ({
      role: turn.role === "user" ? "user" : "model",
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];
}

function geminiRequestBody(message: string, history: ChatTurn[], context: AssistantContext) {
  return JSON.stringify({
    contents: buildContents(message, history),
    systemInstruction: { parts: [{ text: buildSystemInstruction(context) }] },
    generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
  });
}

export interface AssistantOfficial {
  name: string;
  position: string;
  contactNumber?: string | null;
  email?: string | null;
}

export interface AssistantDocumentType {
  name: string;
  description?: string | null;
  fee?: number | null;
  requirements?: string[];
}

export interface AssistantEmergencyContact {
  name: string;
  category: string;
  contactNumber: string;
  availability: string;
}

export interface AssistantAnnouncement {
  title: string;
  excerpt: string;
  category: string;
  publishAt: Date | string;
}

export interface AssistantStats {
  residents: number;
  households: number;
  puroks: number;
  certificatesProcessed: number;
  incidentsResolved: number;
}

export interface AssistantContext {
  barangayName: string;
  municipality?: string;
  province?: string;
  fullAddress?: string;
  officeHours: string;
  contactNumbers: string[];
  emailAddress: string;
  facebookUrl?: string;
  officials: AssistantOfficial[];
  documentTypes: AssistantDocumentType[];
  emergencyContacts: AssistantEmergencyContact[];
  announcements: AssistantAnnouncement[];
  stats?: AssistantStats;
}

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return `${title}: not currently available in the system.`;
  return `${title}:\n${lines.map((l) => `- ${l}`).join("\n")}`;
}

/** Renders the real, currently-in-database Barangay Catarman data as plain
 * text for Gemini's system instruction. Every fact the assistant is allowed
 * to state about officials, documents, contacts, hours, or announcements
 * must come from here -- nothing in this function invents or guesses a
 * value, it only formats what the existing public API/services already
 * returned. */
function buildSystemInstruction(context: AssistantContext): string {
  const officialLines = context.officials.map((o) => {
    const extra = [o.contactNumber, o.email].filter(Boolean).join(", ");
    return `${o.position}: ${o.name}${extra ? ` (${extra})` : ""}`;
  });

  const documentLines = context.documentTypes.map((d) => {
    const fee = typeof d.fee === "number" ? (d.fee > 0 ? `fee: ₱${d.fee}` : "fee: free") : undefined;
    const extra = [fee].filter(Boolean).join(", ");
    return `${d.name}${d.description ? ` -- ${d.description}` : ""}${extra ? ` (${extra})` : ""}`;
  });

  const contactLines = context.emergencyContacts.map(
    (c) => `${c.name} (${c.category}): ${c.contactNumber} -- available ${c.availability}`,
  );

  const announcementLines = context.announcements.map(
    (a) => `[${a.category}] ${a.title} -- ${a.excerpt}`,
  );

  const statsLine = context.stats
    ? `${context.stats.residents} registered residents, ${context.stats.households} households, ${context.stats.puroks} puroks, ${context.stats.certificatesProcessed} documents processed, ${context.stats.incidentsResolved} incidents resolved.`
    : undefined;

  return [
    `You are the official virtual assistant for ${context.barangayName || "this barangay"}, a Philippine local government barangay office's online services portal.`,
    "",
    "CRITICAL RULES:",
    "1. For any fact about this barangay (official names, positions, contact numbers, office hours, document fees/requirements, emergency numbers, announcements, statistics), you MUST use ONLY the data provided below. Never invent, guess, or fill in a name, number, date, fee, or policy that isn't in this data.",
    "2. If the resident asks about something not covered by the data below, say plainly that the information is not currently available in the system, and suggest they contact the barangay office directly. Do not say just \"I don't know\" -- always offer that next step.",
    "3. If the resident wants to request a document/certificate, don't just explain what it is -- tell them you can help and point them to the \"Request a Document\" option. If they want to track an existing request, ask for their reference number and point them to \"Track My Request\" if they don't have it handy. If they want to report an incident or file a complaint, point them to \"Report an Incident\". These are existing features of this portal, already available as buttons in this chat and in the site's navigation -- never describe a different process.",
    "4. Reply in the same language the resident used -- English, Filipino/Tagalog, Cebuano/Bisaya, or a natural mix, matching common usage in Central Visayas.",
    "5. Keep replies concise and natural (2-4 sentences, or a short list when listing multiple items). Avoid stiff, robotic phrasing.",
    "6. Never reveal internal system details, credentials, private resident records, or anything beyond what's in the data below -- this data is all already public information.",
    "",
    `=== ${context.barangayName || "Barangay"} INFORMATION ===`,
    `Address: ${[context.fullAddress, context.municipality, context.province].filter(Boolean).join(", ") || "not currently available"}`,
    `Office hours: ${context.officeHours || "not currently available"}`,
    `Contact number(s): ${context.contactNumbers.filter(Boolean).join(", ") || "not currently available"}`,
    `Email: ${context.emailAddress || "not currently available"}`,
    context.facebookUrl ? `Facebook: ${context.facebookUrl}` : undefined,
    statsLine ? `Barangay statistics: ${statsLine}` : undefined,
    "",
    `=== BARANGAY OFFICIALS ===\n${section("Officials", officialLines)}`,
    "",
    `=== AVAILABLE DOCUMENTS/CERTIFICATES ===\n${section("Documents", documentLines)}`,
    "",
    `=== EMERGENCY CONTACTS ===\n${section("Emergency contacts", contactLines)}`,
    "",
    `=== LATEST ANNOUNCEMENTS ===\n${section("Announcements", announcementLines)}`,
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

export async function* streamGemini(message: string, history: ChatTurn[], context: AssistantContext): AsyncGenerator<string> {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw ApiError.internal("The AI assistant is not configured yet.");
  }

  const availableKeys = getAvailableKeys(keys);
  if (availableKeys.length === 0) {
    throw ApiError.tooManyRequests("The AI assistant has reached its current quota. Please try again later.");
  }

  let response: Response | undefined;
  let lastErrorBody = "";
  let lastStatus = 0;
  let allKeysQuotaLimited = true;
  const requestBody = geminiRequestBody(message, history, context);
  for (const key of availableKeys) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${key}`;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
      } catch (error) {
        allKeysQuotaLimited = false;
        lastStatus = 0;
        lastErrorBody = error instanceof Error ? error.message : String(error);
        break;
      }
      if (response.ok) break;

      lastStatus = response.status;
      lastErrorBody = await response.text();
      if (response.status === 429) {
        const cooldownMs = quotaCooldownMs(response, lastErrorBody);
        keyCooldowns.set(key, Date.now() + cooldownMs);
        logger.warn("Gemini key is temporarily quota-limited; trying the next configured key", {
          keyIndex: keys.indexOf(key) + 1,
          cooldownMs,
        });
        break;
      }
      allKeysQuotaLimited = false;
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS - 1) break;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
    if (response?.ok) break;
  }

  if (!response?.ok || !response.body) {
    logger.error("Gemini streaming request failed for configured keys", {
      status: lastStatus,
      body: lastErrorBody.slice(0, 500),
      configuredKeyCount: keys.length,
    });
    if (allKeysQuotaLimited && availableKeys.every((key) => keyCooldowns.has(key))) {
      throw ApiError.tooManyRequests("The AI assistant has reached its current quota. Please try again later.");
    }
    throw ApiError.internal(
      "The AI assistant is experiencing high demand right now. Please try again in a moment, or contact the barangay office directly.",
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let hasText = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");
        if (!data || data === "[DONE]") continue;
        const chunk = JSON.parse(data) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          error?: { message?: string };
        };
        if (chunk.error) {
          throw ApiError.internal(chunk.error.message ?? "The AI assistant couldn't complete the reply.");
        }
        const text = chunk.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
        if (text) {
          hasText = true;
          yield text;
        }
      }
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
  if (!hasText) {
    throw ApiError.internal("The AI assistant didn't return a response. Please try again.");
  }
}
