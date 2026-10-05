import { body } from "express-validator";

export const createHouseholdValidator = [
  body("sitioId").isUUID(),
  body("purokId").isUUID(),
  body("street").isString().trim().notEmpty(),
  body("houseNumber").optional().isString().trim(),
  body("headResidentId").isUUID(),
  body("memberIds").isArray({ min: 1 }),
  body("memberIds.*").isUUID(),
  body("contactNumber").isString().trim().notEmpty(),
  body("classification")
    .optional()
    .isIn(["NHTS_POOR", "LOW_INCOME", "MIDDLE_INCOME", "NOT_CLASSIFIED"]),
  body("is4PsBeneficiary").optional().isBoolean().toBoolean(),
];

export const updateHouseholdValidator = [
  body("sitioId").optional().isUUID(),
  body("purokId").optional().isUUID(),
  body("headResidentId").optional().isUUID(),
  body("memberIds").optional().isArray(),
  body("memberIds.*").optional().isUUID(),
  body("classification")
    .optional()
    .isIn(["NHTS_POOR", "LOW_INCOME", "MIDDLE_INCOME", "NOT_CLASSIFIED"]),
  body("is4PsBeneficiary").optional().isBoolean().toBoolean(),
];
