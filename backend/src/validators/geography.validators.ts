import { body } from "express-validator";

export const nameValidator = [body("name").isString().trim().notEmpty().withMessage("Name is required")];
