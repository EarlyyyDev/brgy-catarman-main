import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter, publicWriteLimiter, passwordResetLimiter } from "../middlewares/rateLimiter.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import {
  loginValidator,
  forgotPasswordQuestionsValidator,
  resetPasswordValidator,
  securityQuestionsValidator,
  changePasswordValidator,
  updateOwnProfileValidator,
} from "../validators/auth.validators";

const router = Router();

router.post("/login", authLimiter, loginValidator, validateMiddleware, authController.login);
router.post("/refresh", publicWriteLimiter, authController.refresh);
router.post(
  "/forgot-password/questions",
  passwordResetLimiter,
  forgotPasswordQuestionsValidator,
  validateMiddleware,
  authController.getForgotPasswordQuestions,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidator,
  validateMiddleware,
  authController.resetPassword,
);
router.post("/logout", requireAuth, authController.logout);
router.post("/logout-all", requireAuth, authController.logoutAll);
router.post(
  "/change-password",
  requireAuth,
  changePasswordValidator,
  validateMiddleware,
  authController.changePassword,
);
router.get("/me", requireAuth, authController.me);
router.patch("/me", requireAuth, updateOwnProfileValidator, validateMiddleware, authController.updateOwnProfile);
router.patch("/me/avatar", requireAuth, uploadSingle("staff", "avatar"), authController.updateOwnAvatar);
router.patch(
  "/me/security-questions",
  requireAuth,
  securityQuestionsValidator,
  validateMiddleware,
  authController.updateSecurityQuestions,
);

export default router;
