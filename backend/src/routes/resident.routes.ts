import { Router } from "express";
import * as residentController from "../controllers/resident.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import {
  createResidentValidator,
  updateResidentValidator,
  assignTagsValidator,
} from "../validators/resident.validators";

const router = Router();

router.use(requireAuth);

router.get("/", residentController.listResidents);
router.get("/:id", residentController.getResident);
router.post("/", createResidentValidator, validateMiddleware, residentController.createResident);
router.patch("/:id", updateResidentValidator, validateMiddleware, residentController.updateResident);
router.delete("/:id", residentController.deleteResident);
router.put("/:id/tags", assignTagsValidator, validateMiddleware, residentController.assignResidentTags);
router.post("/:id/photo", uploadSingle("residents", "photo"), residentController.uploadResidentPhoto);

export default router;
