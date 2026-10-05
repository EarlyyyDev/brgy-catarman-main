import { body } from "express-validator";

export const notificationValidator = [
  body("title").isString().trim().notEmpty(),
  body("message").isString().trim().notEmpty(),
  body("type").isIn(["INFO", "SUCCESS", "WARNING", "ERROR"]),
  body("link").optional({ values: "falsy" }).isString().trim(),
];
