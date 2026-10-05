import { NextFunction, Request, RequestHandler, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { isTransientDbError } from "./transientDbError.util";

type AsyncRouteHandler<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

// Retries the whole request handler (not just one query) on a transient DB
// connection failure -- see transientDbError.util.ts for what qualifies.
// Scoped to GET requests only, since those are safe to replay; a mutating
// request that failed partway through must never be silently re-run.
const RETRY_DELAYS_MS = [300, 1000, 2000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function asyncHandler<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
  handler: AsyncRouteHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return async (req, res, next) => {
    for (let attempt = 0; ; attempt++) {
      try {
        await handler(req, res, next);
        return;
      } catch (err) {
        const canRetry = req.method === "GET" && !res.headersSent && attempt < RETRY_DELAYS_MS.length;
        if (!canRetry || !isTransientDbError(err)) {
          next(err);
          return;
        }
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  };
}
