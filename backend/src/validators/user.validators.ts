import { body, param } from "express-validator";

export const createUserValidator = [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("role").isIn(["STAFF", "ADMINISTRATOR"]).withMessage("role must be STAFF or ADMINISTRATOR"),
  body("position").isString().trim().notEmpty().withMessage("Position is required"),
  body("contactNumber").optional().isString().trim(),
];

export const updateUserValidator = [
  param("id").isUUID(),
  body("name").optional().isString().trim().notEmpty(),
  body("email").optional().isEmail().normalizeEmail(),
  body("role").optional().isIn(["STAFF", "ADMINISTRATOR"]),
  body("position").optional().isString().trim().notEmpty(),
  body("contactNumber").optional().isString().trim(),
];

export const setPasswordValidator = [
  param("id").isUUID(),
  body("newPassword").isString().isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
];
