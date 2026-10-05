import { body } from "express-validator";

export const createResidentValidator = [
  body("firstName").isString().trim().notEmpty(),
  body("lastName").isString().trim().notEmpty(),
  body("gender").isIn(["MALE", "FEMALE"]),
  body("birthdate").isISO8601(),
  body("civilStatus").isIn(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "DIVORCED"]),
  body("purokId").isUUID(),
  body("street").isString().trim().notEmpty(),
  body("houseNumber").optional().isString().trim(),
  body("contactNumber").isString().trim().notEmpty(),
  body("email").optional({ values: "falsy" }).isEmail(),
  body("isRegisteredVoter").optional().isBoolean().toBoolean(),
];

export const updateResidentValidator = [
  body("firstName").optional().isString().trim().notEmpty(),
  body("lastName").optional().isString().trim().notEmpty(),
  body("gender").optional().isIn(["MALE", "FEMALE"]),
  body("birthdate").optional().isISO8601(),
  body("civilStatus").optional().isIn(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "DIVORCED"]),
  body("purokId").optional().isUUID(),
  body("email").optional({ values: "falsy" }).isEmail(),
  body("isRegisteredVoter").optional().isBoolean().toBoolean(),
];

export const assignTagsValidator = [
  body("tags").isArray(),
  body("tags.*.tagType").isString().notEmpty(),
];
