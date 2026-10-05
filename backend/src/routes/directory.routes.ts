import { Router } from "express";
import * as directoryController from "../controllers/directory.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { officialValidator, emergencyContactValidator, activityValidator } from "../validators/directory.validators";

const officialsRouter = Router();
officialsRouter.use(requireAuth);
officialsRouter.get("/", directoryController.listOfficials);
officialsRouter.post("/", requireAdmin, officialValidator, validateMiddleware, directoryController.createOfficial);
officialsRouter.patch("/:id", requireAdmin, directoryController.updateOfficial);
officialsRouter.delete("/:id", requireAdmin, directoryController.deleteOfficial);

const emergencyContactsRouter = Router();
emergencyContactsRouter.use(requireAuth);
emergencyContactsRouter.get("/", directoryController.listEmergencyContacts);
emergencyContactsRouter.post(
  "/",
  requireAdmin,
  emergencyContactValidator,
  validateMiddleware,
  directoryController.createEmergencyContact,
);
emergencyContactsRouter.patch("/:id", requireAdmin, directoryController.updateEmergencyContact);
emergencyContactsRouter.delete("/:id", requireAdmin, directoryController.deleteEmergencyContact);

const activitiesRouter = Router();
activitiesRouter.use(requireAuth);
activitiesRouter.get("/", directoryController.listActivities);
activitiesRouter.post("/", requireAdmin, activityValidator, validateMiddleware, directoryController.createActivity);
activitiesRouter.patch("/:id", requireAdmin, directoryController.updateActivity);
activitiesRouter.delete("/:id", requireAdmin, directoryController.deleteActivity);

export { officialsRouter, emergencyContactsRouter, activitiesRouter };
