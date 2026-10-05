import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.util";

export function requireRole(...allowedRoles: Array<"STAFF" | "ADMINISTRATOR">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
}

export const requireAdmin = requireRole("ADMINISTRATOR");
