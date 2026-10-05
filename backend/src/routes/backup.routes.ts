import { Router } from "express";
import * as backupController from "../controllers/backup.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

const router = Router();

// Backup files contain every table including User.passwordHash — admin-only,
// and never served via express.static (see backend/backups/ + .gitignore).
router.use(requireAuth, requireAdmin);

router.get("/", backupController.listBackups);
router.post("/", backupController.createBackup);
router.get("/:id/download", backupController.downloadBackup);
router.post("/:id/restore", backupController.restoreBackup);
router.delete("/:id", backupController.deleteBackup);

export default router;
