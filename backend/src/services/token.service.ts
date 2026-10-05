import crypto from "crypto";
import { Request } from "express";
import { env } from "../config/env";
import { sessionRepository } from "../repositories/session.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { userRepository } from "../repositories/user.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import { hashToken, generateRawToken } from "../utils/token.util";
import { parseDurationMs } from "../utils/duration.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

async function issueTokensForNewSession(params: {
  userId: string;
  role: "STAFF" | "ADMINISTRATOR";
  userAgent?: string;
  ipAddress?: string;
  rememberMe: boolean;
}): Promise<IssuedTokens> {
  const { userId, role, userAgent, ipAddress, rememberMe } = params;

  const refreshExpiresIn = rememberMe ? env.JWT_REFRESH_EXPIRES_IN_REMEMBER : env.JWT_REFRESH_EXPIRES_IN;
  const refreshTokenExpiresAt = new Date(Date.now() + parseDurationMs(refreshExpiresIn));

  const session = await sessionRepository.create({
    userId,
    userAgent,
    ipAddress,
    expiresAt: refreshTokenExpiresAt,
  });

  const accessToken = signAccessToken({ sub: userId, sid: session.id, role });
  const accessTokenExpiresAt = new Date(Date.now() + parseDurationMs(env.JWT_ACCESS_EXPIRES_IN));

  const rawRefreshJti = generateRawToken(16);
  const refreshToken = signRefreshToken({ sub: userId, sid: session.id, jti: rawRefreshJti }, refreshExpiresIn);

  await refreshTokenRepository.create({
    sessionId: session.id,
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshTokenExpiresAt,
  });

  const csrfToken = crypto.randomBytes(24).toString("hex");

  return { accessToken, refreshToken, csrfToken, accessTokenExpiresAt, refreshTokenExpiresAt };
}

async function rotateRefreshToken(params: { rawRefreshToken: string; req: Request }): Promise<IssuedTokens> {
  const { rawRefreshToken, req } = params;

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(rawRefreshToken);
  const existing = await refreshTokenRepository.findByHash(tokenHash);

  if (!existing) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  if (existing.revokedAt) {
    // Reuse of an already-rotated-out token: signal of token theft. Contain it
    // by revoking the entire session so the stolen token chain dies here.
    await sessionRepository.revoke(existing.sessionId);
    await refreshTokenRepository.revokeAllForSession(existing.sessionId);
    await activityLogService.log({
      req,
      action: "REFRESH_TOKEN_REUSE_DETECTED",
      module: "AUTHENTICATION",
      description: `Session ${existing.sessionId} revoked due to refresh token reuse`,
      status: "FAILED",
    });
    throw ApiError.unauthorized("Session has been revoked due to suspicious activity");
  }

  const session = await sessionRepository.findActiveById(existing.sessionId);
  if (!session) {
    throw ApiError.unauthorized("Session is no longer active");
  }

  const remainingMs = existing.expiresAt.getTime() - Date.now();
  if (remainingMs <= 0) {
    throw ApiError.unauthorized("Refresh token has expired");
  }

  const user = await userRepository.findById(existing.userId);
  if (!user || user.status !== "ACTIVE") {
    await sessionRepository.revoke(session.id);
    throw ApiError.unauthorized("Account is no longer active");
  }

  const accessToken = signAccessToken({ sub: payload.sub, sid: session.id, role: user.role });
  const accessTokenExpiresAt = new Date(Date.now() + parseDurationMs(env.JWT_ACCESS_EXPIRES_IN));

  const rawRefreshJti = generateRawToken(16);
  const newRefreshToken = signRefreshToken(
    { sub: existing.userId, sid: session.id, jti: rawRefreshJti },
    `${Math.floor(remainingMs / 1000)}s`,
  );

  const created = await refreshTokenRepository.create({
    sessionId: session.id,
    userId: existing.userId,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: existing.expiresAt,
  });

  await refreshTokenRepository.revoke(existing.id, created.id);
  await sessionRepository.touchLastUsed(session.id);

  const csrfToken = crypto.randomBytes(24).toString("hex");

  return {
    accessToken,
    refreshToken: newRefreshToken,
    csrfToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt: existing.expiresAt,
  };
}

export const tokenService = { issueTokensForNewSession, rotateRefreshToken };
