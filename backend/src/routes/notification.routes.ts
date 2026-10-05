import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { notificationValidator } from "../validators/notification.validators";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.post("/", requireAdmin, notificationValidator, validateMiddleware, notificationController.createNotification);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);
router.delete("/:id", requireAdmin, notificationController.deleteNotification);

export default router;
