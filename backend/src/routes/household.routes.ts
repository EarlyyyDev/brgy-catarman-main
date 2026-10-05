import { Router } from "express";
import * as householdController from "../controllers/household.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { createHouseholdValidator, updateHouseholdValidator } from "../validators/household.validators";

const router = Router();

router.use(requireAuth);

router.get("/", householdController.listHouseholds);
router.get("/:id", householdController.getHousehold);
router.post("/", createHouseholdValidator, validateMiddleware, householdController.createHousehold);
router.patch("/:id", updateHouseholdValidator, validateMiddleware, householdController.updateHousehold);
router.patch("/:id/archive", householdController.archiveHousehold);
router.patch("/:id/restore", householdController.restoreHousehold);
router.delete("/:id", householdController.deleteHousehold);

export default router;
