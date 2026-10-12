import { Request, Response } from "express";
import { AssistantContext, ChatTurn, streamGemini } from "../utils/gemini.util";
import { settingsService } from "../services/settings.service";
import { officialService } from "../services/official.service";
import { documentTypeService } from "../services/documentType.service";
import { emergencyContactService } from "../services/emergencyContact.service";
import { announcementRepository } from "../repositories/announcement.repository";
import { dashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler.util";
import { logger } from "../utils/logger.util";

const CONTEXT_CACHE_TTL_MS = 5 * 60_000;

let assistantContextCache: { expiresAt: number; value: AssistantContext } | undefined;
let assistantContextPromise: Promise<AssistantContext> | undefined;

async function getAssistantContext(): Promise<AssistantContext> {
  if (assistantContextCache && assistantContextCache.expiresAt > Date.now()) {
    return assistantContextCache.value;
  }
  if (!assistantContextPromise) {
    assistantContextPromise = (async () => {
      const [settings, officials, documentTypes, emergencyContacts, { items: announcements }, stats] = await Promise.all([
        settingsService.getPublic() as Promise<Record<string, unknown> | null>,
        officialService.list(),
        documentTypeService.list(true),
        emergencyContactService.list(),
        announcementRepository.listPublished({ skip: 0, take: 5 }),
        dashboardService.getPublicStats(),
      ]);

      return {
        barangayName: (settings?.barangayName as string) ?? "",
        municipality: settings?.municipality as string | undefined,
        province: settings?.province as string | undefined,
        fullAddress: settings?.fullAddress as string | undefined,
        officeHours: (settings?.officeHours as string) ?? "",
        contactNumbers: (settings?.contactNumbers as string[]) ?? [],
        emailAddress: (settings?.emailAddress as string) ?? "",
        facebookUrl: settings?.facebookUrl as string | undefined,
        officials: officials.map((o) => ({
          name: o.name,
          position: o.position,
          contactNumber: o.contactNumber,
          email: o.email,
        })),
        documentTypes: documentTypes.map((d) => ({
          name: d.name,
          description: d.description,
          fee: Number(d.fee),
          requirements: d.requirements,
        })),
        emergencyContacts: emergencyContacts.map((c) => ({
          name: c.name,
          category: c.category,
          contactNumber: c.contactNumber,
          availability: c.availability,
        })),
        announcements: announcements.map((a) => ({
          title: a.title,
          excerpt: a.excerpt,
          category: a.category,
          publishAt: a.publishAt,
        })),
        stats,
      };
    })();
  }

  try {
    const value = await assistantContextPromise;
    assistantContextCache = { value, expiresAt: Date.now() + CONTEXT_CACHE_TTL_MS };
    return value;
  } finally {
    assistantContextPromise = undefined;
  }
}

export const chatWithAssistant = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body as { message: string; history?: ChatTurn[] };
  const context = await getAssistantContext();
  const stream = streamGemini(message, history ?? [], context);
  const firstChunk = await stream.next();

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    if (!firstChunk.done) res.write(`data: ${JSON.stringify({ text: firstChunk.value })}\n\n`);
    for await (const text of stream) {
      if (res.destroyed) break;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    if (!res.destroyed) res.write("data: [DONE]\n\n");
  } catch (error) {
    logger.error("AI response stream ended with an error", { error: error instanceof Error ? error.message : String(error) });
    if (!res.destroyed) res.write(`data: ${JSON.stringify({ error: "The reply was interrupted. Please try again." })}\n\n`);
  } finally {
    if (!res.destroyed && !res.writableEnded) res.end();
  }
});
