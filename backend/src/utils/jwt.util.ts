import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  role: "STAFF" | "ADMINISTRATOR";
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  jti: string;
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  expiresIn: string,
): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
