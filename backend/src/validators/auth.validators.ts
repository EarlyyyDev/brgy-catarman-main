import { body } from "express-validator";
import { SECURITY_QUESTIONS } from "../constants/securityQuestions";

export const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required"),
  body("rememberMe").optional().isBoolean().toBoolean(),
];

export const forgotPasswordQuestionsValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
];

export const resetPasswordValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("answer1").isString().trim().notEmpty().withMessage("Please answer the first question"),
  body("answer2").isString().trim().notEmpty().withMessage("Please answer the second question"),
  body("newPassword").isString().isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
];

export const securityQuestionsValidator = [
  body("question1").isIn(SECURITY_QUESTIONS).withMessage("Please choose a valid question"),
  body("answer1").isString().trim().notEmpty().withMessage("Please answer the first question"),
  body("question2").isIn(SECURITY_QUESTIONS).withMessage("Please choose a valid question"),
  body("answer2").isString().trim().notEmpty().withMessage("Please answer the second question"),
];

export const changePasswordValidator = [
  body("currentPassword").isString().notEmpty().withMessage("Current password is required"),
  body("newPassword").isString().isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
];

export const updateOwnProfileValidator = [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
];
