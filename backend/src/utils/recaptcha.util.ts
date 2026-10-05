import { env } from "../config/env";
import { ApiError } from "./apiError.util";
import { logger } from "./logger.util";

interface RecaptchaVerificationResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyRecaptchaToken(token: string, remoteIp?: string): Promise<void> {
  if (!env.RECAPTCHA_SECRET_KEY) {
    throw new ApiError(503, "Google reCAPTCHA is not configured on the server.");
  }

  const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let response: Response;
  try {
    response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    logger.error("Google reCAPTCHA verification request failed", { error });
    throw new ApiError(503, "Captcha verification is temporarily unavailable. Please try again.");
  }

  if (!response.ok) {
    logger.error("Google reCAPTCHA verification returned a non-success status", { status: response.status });
    throw new ApiError(503, "Captcha verification is temporarily unavailable. Please try again.");
  }

  const result = (await response.json()) as RecaptchaVerificationResponse;
  if (!result.success) {
    logger.warn("Google reCAPTCHA rejected a public submission", { errorCodes: result["error-codes"] ?? [] });
    throw ApiError.badRequest("Captcha verification failed or expired. Please complete it again.");
  }
}