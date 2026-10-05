import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", settingsController.getSettings);
router.patch("/", settingsController.updateSettings);
router.post("/upload", uploadSingle("settings", "file"), settingsController.uploadSettingsImage);

export default router;
