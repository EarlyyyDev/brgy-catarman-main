import { body } from "express-validator";

export const contactFormValidator = [
  body("name").isString().trim().notEmpty(),
  body("email").isEmail(),
  body("subject").isString().trim().notEmpty(),
  body("message").isString().trim().isLength({ min: 10 }),
];
