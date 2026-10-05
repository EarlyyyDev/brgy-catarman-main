import { Router } from "express";
import * as documentTypeController from "../controllers/documentType.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { documentTypeValidator } from "../validators/certificate.validators";

const router = Router();

router.use(requireAuth);

router.get("/", documentTypeController.listDocumentTypes);
router.post("/", requireAdmin, documentTypeValidator, validateMiddleware, documentTypeController.createDocumentType);
router.patch("/:id", requireAdmin, documentTypeController.updateDocumentType);
router.delete("/:id", requireAdmin, documentTypeController.deleteDocumentType);

export default router;
