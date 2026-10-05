import { body } from "express-validator";

export const createBlotterValidator = [
  body("incidentType").isString().trim().notEmpty(),
  body("complainantName").isString().trim().notEmpty(),
  body("complainantAddress").isString().trim().notEmpty(),
  body("complainantContact").isString().trim().notEmpty(),
  body("respondentName").isString().trim().notEmpty(),
  body("respondentAddress").isString().trim().notEmpty(),
  body("incidentDate").isISO8601(),
  body("location").isString().trim().notEmpty(),
  body("narrative").isString().trim().notEmpty(),
  body("mediatorId").optional().isUUID(),
];

export const updateBlotterStatusValidator = [
  body("status").isIn(["OPEN", "UNDER_MEDIATION", "SETTLED", "ESCALATED_TO_COURT", "CLOSED", "ARCHIVED"]),
  body("resolution").optional().isString(),
];

export const addHearingValidator = [
  body("date").isISO8601(),
  body("notes").optional().isString(),
];

export const updateHearingStatusValidator = [body("status").isIn(["SCHEDULED", "COMPLETED", "CANCELLED"])];

export const addCaseNoteValidator = [body("note").isString().trim().notEmpty()];

export const blotterTemplateValidator = [
  body("name").isString().trim().notEmpty(),
  body("bodyHtml").isString().notEmpty(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
];
