import { Request, Response } from "express";
import { sendError } from "../utils/apiResponse.util";

export function notFoundMiddleware(req: Request, res: Response) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}
