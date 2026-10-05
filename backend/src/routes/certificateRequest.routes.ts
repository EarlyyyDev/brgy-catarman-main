import { Router } from "express";
import * as certificateRequestController from "../controllers/certificateRequest.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import {
  publicCertificateRequestValidator,
  updateCertificateStatusValidator,
} from "../validators/certificate.validators";

const router = Router();

router.use(requireAuth);

router.get("/", certificateRequestController.listCertificateRequests);
router.get("/:id", certificateRequestController.getCertificateRequest);
router.post(
  "/walk-in",
  publicCertificateRequestValidator,
  validateMiddleware,
  certificateRequestController.submitWalkInCertificateRequest,
);
router.patch(
  "/:id/status",
  updateCertificateStatusValidator,
  validateMiddleware,
  certificateRequestController.updateCertificateStatus,
);
router.post(
  "/:id/requirements",
  uploadSingle("certificates", "file"),
  certificateRequestController.uploadCertificateRequirement,
);
router.delete("/:id", certificateRequestController.deleteCertificateRequest);

export default router;
