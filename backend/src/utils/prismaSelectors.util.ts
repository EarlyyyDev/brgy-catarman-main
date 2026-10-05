import { Prisma } from "@prisma/client";

/**
 * Safe projection for nesting a User relation into another entity's
 * response (e.g. CertificateRequest.processedBy, Blotter.mediator,
 * Announcement.author). Excludes passwordHash and password-reset token
 * fields, which `include: { relation: true }` would otherwise leak
 * verbatim into every API response that touches the relation.
 */
export const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  position: true,
  avatarUrl: true,
  status: true,
} satisfies Prisma.UserSelect;
