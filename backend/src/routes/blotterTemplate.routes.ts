import { Router } from "express";
import * as blotterTemplateController from "../controllers/blotterTemplate.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { blotterTemplateValidator } from "../validators/blotter.validators";

const router = Router();

router.use(requireAuth);

router.get("/", blotterTemplateController.listBlotterTemplates);
router.get("/:id", blotterTemplateController.getBlotterTemplate);
router.post(
  "/",
  blotterTemplateValidator,
  validateMiddleware,
  blotterTemplateController.createBlotterTemplate,
);
router.patch("/:id", blotterTemplateController.updateBlotterTemplate);
router.delete("/:id", blotterTemplateController.deleteBlotterTemplate);

export default router;
