import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponse.util";

export function validateMiddleware(req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  sendError(res, 422, "Validation failed", result.array());
}
