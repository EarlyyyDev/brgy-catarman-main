import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { createUserValidator, updateUserValidator, setPasswordValidator } from "../validators/user.validators";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", userController.listUsers);
router.get("/:id", userController.getUser);
router.post("/", createUserValidator, validateMiddleware, userController.createUser);
router.patch("/:id", updateUserValidator, validateMiddleware, userController.updateUser);
router.patch("/:id/status", userController.toggleUserStatus);
router.patch("/:id/password", setPasswordValidator, validateMiddleware, userController.setUserPassword);
router.patch("/:id/avatar", uploadSingle("staff", "avatar"), userController.updateUserAvatar);
router.delete("/:id", userController.deleteUser);

export default router;
