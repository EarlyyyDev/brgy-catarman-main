import { Router } from "express";
import * as announcementController from "../controllers/announcement.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { publicUrlFor } from "../config/multer";
import { announcementValidator } from "../validators/announcement.validators";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/apiResponse.util";
import { Request, Response } from "express";

const router = Router();

router.use(requireAuth);

router.get("/", announcementController.listAnnouncements);
router.get("/:id", announcementController.getAnnouncement);
router.post("/", announcementValidator, validateMiddleware, announcementController.createAnnouncement);
router.patch("/:id", announcementController.updateAnnouncement);
router.patch("/:id/pin", announcementController.togglePinAnnouncement);
router.delete("/:id", announcementController.deleteAnnouncement);
router.delete("/comments/:commentId", announcementController.deleteComment);

router.post("/:id/comments", announcementController.addComment);
router.post("/comments/:commentId/replies", announcementController.addReply);
router.put("/:id/reaction", announcementController.setPostReaction);
router.put("/comments/:commentId/reaction", announcementController.setCommentReaction);

router.post(
  "/:id/attachments",
  // Infinity -> maxSizeMb * 1024 * 1024 is still Infinity, and multer's
  // internal "receivedBytes > fileSize" check is always false against it --
  // this is a real, no-special-casing way to mean "no limit" for this route.
  uploadSingle("announcements", "file", Infinity),
  asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    if (!req.file) {
      sendSuccess(res, { message: "No file uploaded" }, 400);
      return;
    }
    sendSuccess(
      res,
      {
        name: req.file.originalname,
        url: publicUrlFor("announcements", req.file.filename),
        mimeType: req.file.mimetype,
        sizeKb: Math.round(req.file.size / 1024),
      },
      201,
    );
  }),
);

export default router;
