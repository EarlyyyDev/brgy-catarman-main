import { Request, Response } from "express";
import { askGemini, ChatTurn } from "../utils/gemini.util";
import { settingsService } from "../services/settings.service";
import { officialService } from "../services/official.service";
import { documentTypeService } from "../services/documentType.service";
import { emergencyContactService } from "../services/emergencyContact.service";
import { announcementRepository } from "../repositories/announcement.repository";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const chatWithAssistant = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body as { message: string; history?: ChatTurn[] };

  const [settings, officials, documentTypes, emergencyContacts, { items: announcements }, stats] = await Promise.all([
    settingsService.getPublic() as Promise<Record<string, unknown> | null>,
    officialService.list(),
    documentTypeService.list(true),
    emergencyContactService.list(),
    announcementRepository.listPublished({ skip: 0, take: 5 }),
    dashboardService.getPublicStats(),
  ]);

  const reply = await askGemini(message, history ?? [], {
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
  });

  sendSuccess(res, { text: reply });
});
