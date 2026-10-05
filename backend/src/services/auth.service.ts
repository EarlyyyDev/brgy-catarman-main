import { Request } from "express";
import { userRepository } from "../repositories/user.repository";
import { sessionRepository } from "../repositories/session.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { activityLogRepository } from "../repositories/activityLog.repository";
import { hashPassword, verifyPassword } from "../utils/hash.util";
import { ApiError } from "../utils/apiError.util";
import { tokenService } from "./token.service";
import { activityLogService } from "./activityLog.service";

// Case/whitespace-insensitive so a legitimately correct answer never fails
// just because it was typed with different capitalization than when it was
// first set.
function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: "STAFF" | "ADMINISTRATOR";
  position: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "DISABLED";
  contactNumber: string | null;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  securityQuestion1?: string | null;
  securityQuestion2?: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    position: user.position,
    avatarUrl: user.avatarUrl,
    securityQuestionsSet: Boolean(user.securityQuestion1 && user.securityQuestion2),
    securityQuestion1: user.securityQuestion1 ?? undefined,
    securityQuestion2: user.securityQuestion2 ?? undefined,
    status: user.status,
    contactNumber: user.contactNumber,
    mustChangePassword: user.mustChangePassword,
    lastLogin: user.lastLoginAt,
  };
}

async function login(params: { email: string; password: string; rememberMe: boolean; req: Request }) {
  const { email, password, rememberMe, req } = params;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    await activityLogService.log({
      req,
      action: "Failed login attempt",
      module: "AUTHENTICATION",
      description: `No account found for ${email}`,
      status: "FAILED",
    });
    throw ApiError.unauthorized("No staff account found with that email address.");
  }

  if (user.status === "DISABLED") {
    throw ApiError.forbidden("This account has been disabled. Please contact your administrator.");
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    await activityLogService.log({
      req,
      action: "Failed login attempt",
      module: "AUTHENTICATION",
      description: "Incorrect password",
      status: "FAILED",
    });
    throw ApiError.unauthorized("Incorrect password. Please try again.");
  }

  const tokens = await tokenService.issueTokensForNewSession({
    userId: user.id,
    role: user.role,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    rememberMe,
  });

  await userRepository.updateLastLogin(user.id);

  // req.user isn't set yet at this point in the request lifecycle (this IS
  // the login call) so activityLogService.log would fall back to "System" —
  // write this one entry directly with the now-known identity instead.
  await activityLogRepository.create({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: "Logged in",
    module: "AUTHENTICATION",
    ipAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? req.socket.remoteAddress,
    browser: req.headers["user-agent"],
    status: "SUCCESS",
  });

  return { user: toPublicUser(user), tokens };
}

async function logout(params: { sessionId: string; req: Request }) {
  const { sessionId, req } = params;
  await sessionRepository.revoke(sessionId);
  await refreshTokenRepository.revokeAllForSession(sessionId);
  await activityLogService.log({ req, action: "Logged out", module: "AUTHENTICATION" });
}

async function logoutAll(params: { userId: string; req: Request }) {
  const { userId, req } = params;
  await sessionRepository.revokeAllForUser(userId);
  await activityLogService.log({ req, action: "Logged out of all devices", module: "AUTHENTICATION" });
}

async function getSecurityQuestions(params: { email: string }) {
  const user = await userRepository.findByEmail(params.email);
  if (!user || user.status !== "ACTIVE" || !user.securityQuestion1 || !user.securityQuestion2) {
    throw ApiError.notFound(
      "No account found with that email, or security questions haven't been set up for it yet. Please log in and set them up first, or contact your administrator.",
    );
  }
  return { question1: user.securityQuestion1, question2: user.securityQuestion2 };
}

async function resetPasswordWithSecurityAnswers(params: {
  email: string;
  answer1: string;
  answer2: string;
  newPassword: string;
  req: Request;
}) {
  const { email, answer1, answer2, newPassword, req } = params;
  const user = await userRepository.findByEmail(email);
  if (!user || user.status !== "ACTIVE" || !user.securityAnswer1Hash || !user.securityAnswer2Hash) {
    throw ApiError.badRequest("Security questions haven't been set up for this account.");
  }

  const [answer1Valid, answer2Valid] = await Promise.all([
    verifyPassword(normalizeAnswer(answer1), user.securityAnswer1Hash),
    verifyPassword(normalizeAnswer(answer2), user.securityAnswer2Hash),
  ]);
  if (!answer1Valid || !answer2Valid) {
    throw ApiError.badRequest("One or more answers were incorrect. Please try again.");
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(user.id, passwordHash);
  // A password reset should also invalidate any sessions that may already
  // be open (e.g. on a device that's no longer trusted).
  await sessionRepository.revokeAllForUser(user.id);

  await activityLogRepository.create({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: "Reset password via security questions",
    module: "AUTHENTICATION",
    ipAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? req.socket.remoteAddress,
    browser: req.headers["user-agent"],
    status: "SUCCESS",
  });
}

async function setSecurityQuestions(params: {
  userId: string;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  req: Request;
}) {
  const { userId, question1, answer1, question2, answer2, req } = params;
  if (question1 === question2) {
    throw ApiError.badRequest("Please choose two different questions.");
  }

  const [answer1Hash, answer2Hash] = await Promise.all([
    hashPassword(normalizeAnswer(answer1)),
    hashPassword(normalizeAnswer(answer2)),
  ]);
  await userRepository.setSecurityQuestions(userId, {
    securityQuestion1: question1,
    securityAnswer1Hash: answer1Hash,
    securityQuestion2: question2,
    securityAnswer2Hash: answer2Hash,
  });

  await activityLogService.log({ req, action: "Updated security questions", module: "AUTHENTICATION" });
}

async function changePassword(params: { userId: string; currentPassword: string; newPassword: string; req: Request }) {
  const { userId, currentPassword, newPassword, req } = params;

  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.unauthorized();
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, passwordHash);
  await activityLogService.log({ req, action: "Changed own password", module: "AUTHENTICATION" });
}

export const authService = {
  login,
  logout,
  logoutAll,
  getSecurityQuestions,
  resetPasswordWithSecurityAnswers,
  setSecurityQuestions,
  changePassword,
  toPublicUser,
};
