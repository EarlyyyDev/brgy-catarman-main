import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { tokenService } from "../services/token.service";
import { userService } from "../services/user.service";
import { userRepository } from "../repositories/user.repository";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.util";
import { sendSuccess } from "../utils/apiResponse.util";
import { ApiError } from "../utils/apiError.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { publicUrlFor } from "../config/multer";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body as { email: string; password: string; rememberMe?: boolean };

  const { user, tokens } = await authService.login({ email, password, rememberMe: Boolean(rememberMe), req });
  setAuthCookies(res, tokens);
  sendSuccess(res, user);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refresh_token as string | undefined;
  if (!rawRefreshToken) {
    throw ApiError.unauthorized("No refresh token provided");
  }

  const tokens = await tokenService.rotateRefreshToken({ rawRefreshToken, req });
  setAuthCookies(res, tokens);
  sendSuccess(res, { refreshed: true });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await authService.logout({ sessionId: req.user.sessionId, req });
  }
  clearAuthCookies(res);
  sendSuccess(res, { loggedOut: true });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll({ userId: req.user!.id, req });
  clearAuthCookies(res);
  sendSuccess(res, { loggedOutAll: true });
});

export const getForgotPasswordQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const questions = await authService.getSecurityQuestions({ email });
  sendSuccess(res, questions);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, answer1, answer2, newPassword } = req.body as {
    email: string;
    answer1: string;
    answer2: string;
    newPassword: string;
  };
  await authService.resetPasswordWithSecurityAnswers({ email, answer1, answer2, newPassword, req });
  sendSuccess(res, { message: "Password reset successfully. You may now log in with your new password." });
});

export const updateSecurityQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { question1, answer1, question2, answer2 } = req.body as {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
  };
  await authService.setSecurityQuestions({ userId: req.user!.id, question1, answer1, question2, answer2, req });
  sendSuccess(res, { message: "Security questions updated." });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  await authService.changePassword({ userId: req.user!.id, currentPassword, newPassword, req });
  sendSuccess(res, { message: "Password changed successfully." });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await userRepository.findById(req.user!.id);
  if (!user) {
    throw ApiError.unauthorized();
  }
  sendSuccess(res, authService.toPublicUser(user));
});

// Self-service profile edits, available to every authenticated role (Staff
// included) -- deliberately separate from the admin-only /api/users routes,
// and deliberately only ever targets req.user!.id so no one can edit anyone
// else's profile through this path. Only "name" is accepted (never
// role/email/status) to avoid it becoming a privilege-escalation route.
export const updateOwnProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const user = await userService.update(req.user!.id, { name }, req);
  sendSuccess(res, user);
});

export const updateOwnAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendSuccess(res, { message: "No file uploaded" }, 400);
    return;
  }
  const url = publicUrlFor("staff", req.file.filename);
  const user = await userService.updateAvatar(req.user!.id, url, req);
  sendSuccess(res, user);
});
