import { Router } from "express";
import * as documentTypeController from "../controllers/documentType.controller";
import * as certificateRequestController from "../controllers/certificateRequest.controller";
import * as complaintController from "../controllers/complaint.controller";
import * as announcementController from "../controllers/announcement.controller";
import * as directoryController from "../controllers/directory.controller";
import * as settingsController from "../controllers/settings.controller";
import * as dashboardController from "../controllers/dashboard.controller";
import * as aiAssistantController from "../controllers/aiAssistant.controller";
import * as residentController from "../controllers/resident.controller";
import { publicLimiter, publicWriteLimiter, aiAssistantLimiter } from "../middlewares/rateLimiter.middleware";
import { optionalAuth } from "../middlewares/auth.middleware";
import { maintenanceGuard } from "../middlewares/maintenanceGuard.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { publicCertificateBatchRequestValidator } from "../validators/certificate.validators";
import { submitComplaintValidator, addPhotoValidator } from "../validators/complaint.validators";
import { commentValidator, reactionValidator } from "../validators/announcement.validators";
import { contactFormValidator } from "../validators/settings.validators";
import { aiAssistantChatValidator } from "../validators/aiAssistant.validators";

const router = Router();

router.use(publicLimiter);

router.get("/document-types", documentTypeController.listDocumentTypes);
router.get("/stats", dashboardController.getPublicDashboardStats);
router.get("/residents/search", residentController.searchPublicResidents);
router.post(
  "/ai-assistant/chat",
  aiAssistantLimiter,
  aiAssistantChatValidator,
  validateMiddleware,
  aiAssistantController.chatWithAssistant,
);

router.post(
  "/certificate-requests",
  publicWriteLimiter,
  maintenanceGuard,
  publicCertificateBatchRequestValidator,
  validateMiddleware,
  certificateRequestController.submitPublicCertificateRequest,
);
router.get(
  "/certificate-requests/track/:referenceNumber",
  certificateRequestController.trackCertificateRequest,
);
// Anonymous requestors upload their requirement documents (Valid ID, etc.)
// here — no auth, matching the same pattern as public complaint photos.
router.post(
  "/certificate-requests/:id/requirements",
  publicWriteLimiter,
  maintenanceGuard,
  uploadSingle("certificates", "file"),
  certificateRequestController.uploadCertificateRequirement,
);

router.post(
  "/complaints",
  publicWriteLimiter,
  maintenanceGuard,
  submitComplaintValidator,
  validateMiddleware,
  complaintController.submitComplaint,
);
router.get("/complaints/track/:referenceNumber", complaintController.trackComplaint);
// Anonymous reporters upload their mandatory live-camera verification photo
// (and any evidence) here — no auth, since residents don't have accounts.
router.post(
  "/complaints/:id/photos",
  publicWriteLimiter,
  maintenanceGuard,
  uploadSingle("complaints", "photo"),
  addPhotoValidator,
  validateMiddleware,
  complaintController.addComplaintPhoto,
);

router.get("/announcements", announcementController.listPublishedAnnouncements);
router.get("/announcements/:id", optionalAuth, announcementController.getAnnouncement);
router.post(
  // No optionalAuth here (deliberately, unlike the routes below): this is
  // the anonymous resident comment box, and residents have no accounts. If
  // the browser happens to also carry a valid staff/admin session cookie
  // (e.g. they're logged into the dashboard in the same browser), that must
  // never leak into authorship here -- every public submission is anonymous
  // regardless of what else is logged in on this device. Genuine staff/admin
  // comments go through the separate, requireAuth-guarded dashboard route in
  // announcement.routes.ts.
  "/announcements/:id/comments",
  publicWriteLimiter,
  maintenanceGuard,
  commentValidator,
  validateMiddleware,
  announcementController.addComment,
);
router.post(
  "/comments/:commentId/replies",
  publicWriteLimiter,
  maintenanceGuard,
  commentValidator,
  validateMiddleware,
  announcementController.addReply,
);
router.put(
  "/announcements/:id/reaction",
  publicWriteLimiter,
  maintenanceGuard,
  optionalAuth,
  reactionValidator,
  validateMiddleware,
  announcementController.setPostReaction,
);
router.put(
  "/comments/:commentId/reaction",
  publicWriteLimiter,
  maintenanceGuard,
  optionalAuth,
  reactionValidator,
  validateMiddleware,
  announcementController.setCommentReaction,
);

router.get("/officials", directoryController.listOfficials);
router.get("/emergency-contacts", directoryController.listEmergencyContacts);
router.get("/activities", directoryController.listActivities);
router.get("/settings", settingsController.getPublicSettings);
router.post(
  "/contact",
  publicWriteLimiter,
  maintenanceGuard,
  contactFormValidator,
  validateMiddleware,
  settingsController.submitContactForm,
);

export default router;
