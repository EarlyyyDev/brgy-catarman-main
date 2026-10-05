import { body } from "express-validator";

export const aiAssistantChatValidator = [
  body("message").isString().trim().notEmpty().isLength({ max: 500 }),
  body("history").optional().isArray({ max: 12 }),
  body("history.*.role").optional().isIn(["user", "assistant"]),
  body("history.*.text").optional().isString().isLength({ max: 500 }),
];
