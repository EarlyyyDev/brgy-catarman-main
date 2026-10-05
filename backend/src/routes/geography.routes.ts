import { Router } from "express";
import * as geographyController from "../controllers/geography.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { nameValidator } from "../validators/geography.validators";

const router = Router();

router.use(requireAuth);

router.get("/sitios", geographyController.listSitios);
router.post("/sitios", nameValidator, validateMiddleware, geographyController.addSitio);
router.patch("/sitios/:id", nameValidator, validateMiddleware, geographyController.renameSitio);
router.delete("/sitios/:id", geographyController.deleteSitio);

router.post("/sitios/:sitioId/puroks", nameValidator, validateMiddleware, geographyController.addPurok);
router.patch("/puroks/:id", nameValidator, validateMiddleware, geographyController.renamePurok);
router.delete("/puroks/:id", geographyController.deletePurok);

export default router;
