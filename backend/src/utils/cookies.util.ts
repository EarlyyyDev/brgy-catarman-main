import { Response } from "express";
import { env } from "../config/env";
import { IssuedTokens } from "../services/token.service";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  domain: env.NODE_ENV === "production" ? env.COOKIE_DOMAIN : undefined,
};

export function setAuthCookies(res: Response, tokens: IssuedTokens) {
  res.cookie("access_token", tokens.accessToken, {
    ...baseCookieOptions,
    expires: tokens.accessTokenExpiresAt,
    path: "/",
  });

  res.cookie("refresh_token", tokens.refreshToken, {
    ...baseCookieOptions,
    expires: tokens.refreshTokenExpiresAt,
    path: "/api/auth",
  });

  res.cookie("csrf_token", tokens.csrfToken, {
    ...baseCookieOptions,
    httpOnly: false,
    expires: tokens.accessTokenExpiresAt,
    path: "/",
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", { ...baseCookieOptions, path: "/" });
  res.clearCookie("refresh_token", { ...baseCookieOptions, path: "/api/auth" });
  res.clearCookie("csrf_token", { ...baseCookieOptions, httpOnly: false, path: "/" });
}
