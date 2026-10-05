import { Router } from "express";
import * as blotterController from "../controllers/blotter.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import {
  createBlotterValidator,
  updateBlotterStatusValidator,
  addHearingValidator,
  updateHearingStatusValidator,
  addCaseNoteValidator,
} from "../validators/blotter.validators";

const router = Router();

router.use(requireAuth);

router.get("/", blotterController.listBlotters);
router.get("/:id", blotterController.getBlotter);
router.post("/", createBlotterValidator, validateMiddleware, blotterController.createBlotter);
router.patch("/:id", blotterController.updateBlotter);
router.patch(
  "/:id/status",
  updateBlotterStatusValidator,
  validateMiddleware,
  blotterController.updateBlotterStatus,
);
router.patch("/:id/archive", blotterController.archiveBlotter);
router.delete("/:id", blotterController.deleteBlotter);
router.post("/:id/hearings", addHearingValidator, validateMiddleware, blotterController.addHearing);
router.patch(
  "/:id/hearings/:hearingId",
  updateHearingStatusValidator,
  validateMiddleware,
  blotterController.updateHearingStatus,
);
router.post("/:id/notes", addCaseNoteValidator, validateMiddleware, blotterController.addCaseNote);

export default router;
