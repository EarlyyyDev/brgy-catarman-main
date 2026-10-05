import { body } from "express-validator";

export const officialValidator = [
  body("name").isString().trim().notEmpty(),
  body("position").isString().trim().notEmpty(),
  body("termStart").isISO8601(),
  body("termEnd").isISO8601(),
  body("order").optional().isInt(),
  body("email").optional({ values: "falsy" }).isEmail(),
];

export const emergencyContactValidator = [
  body("name").isString().trim().notEmpty(),
  body("category").isIn(["POLICE", "FIRE", "MEDICAL", "DISASTER_RESPONSE", "BARANGAY_HOTLINE", "OTHER"]),
  body("contactNumber").isString().trim().notEmpty(),
  body("availability").isString().trim().notEmpty(),
];

export const activityValidator = [
  body("title").isString().trim().notEmpty(),
  body("description").isString().trim().notEmpty(),
  body("location").isString().trim().notEmpty(),
  body("startDate").isISO8601(),
  body("endDate").isISO8601(),
];
