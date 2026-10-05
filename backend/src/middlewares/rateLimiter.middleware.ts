import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse.util";

// Guards ONLY the login endpoint's credential-guessing surface. Kept tight and
// isolated from everything else so ordinary public-site activity (reactions,
// comments, the auto session-refresh every page load triggers) can never eat
// into a real staff/admin's login attempt budget.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many attempts. Please try again later.");
  },
});

// For /auth/forgot-password and /auth/reset-password. Security-sensitive
// like login, but kept in its own bucket -- a real login lockout shouldn't
// also block someone from requesting a reset, and vice versa.
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many attempts. Please try again later.");
  },
});

// For /auth/refresh and anonymous public write actions (reactions, comments,
// certificate/complaint submissions, contact form). These are triggered
// constantly by normal browsing -- e.g. every page load silently retries a
// session refresh for anonymous visitors -- so they need real headroom and
// must never share a bucket with the login form.
export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many requests. Please try again later.");
  },
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many requests. Please try again later.");
  },
});

// Tighter than publicLimiter: this hits a paid, per-call external API, so an
// anonymous visitor should not be able to run up a real bill.
export const aiAssistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "You've sent a lot of messages. Please wait a bit before trying again.");
  },
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many requests. Please try again later.");
  },
});
