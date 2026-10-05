import { Router } from "express";
import * as certificateTemplateController from "../controllers/certificateTemplate.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { certificateTemplateValidator } from "../validators/certificate.validators";

const router = Router();

router.use(requireAuth);

router.get("/", certificateTemplateController.listCertificateTemplates);
router.get("/:id", certificateTemplateController.getCertificateTemplate);
router.post(
  "/",
  certificateTemplateValidator,
  validateMiddleware,
  certificateTemplateController.createCertificateTemplate,
);
router.patch("/:id", certificateTemplateController.updateCertificateTemplate);
router.delete("/:id", certificateTemplateController.deleteCertificateTemplate);

export default router;
