import { Router } from "express";
import * as complaintController from "../controllers/complaint.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { updateComplaintStatusValidator, addPhotoValidator } from "../validators/complaint.validators";

const router = Router();

router.use(requireAuth);

router.get("/", complaintController.listComplaints);
router.get("/:id", complaintController.getComplaint);
router.patch(
  "/:id/status",
  updateComplaintStatusValidator,
  validateMiddleware,
  complaintController.updateComplaintStatus,
);
router.post(
  "/:id/photos",
  uploadSingle("complaints", "photo"),
  addPhotoValidator,
  validateMiddleware,
  complaintController.addComplaintPhoto,
);

export default router;
