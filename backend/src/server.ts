import dns from "node:dns";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger.util";

// This ISP resolves Neon's AWS ap-southeast-1 hostname to a broken/blackholed
// IPv6 route, so Node's default "try AAAA first" DNS order made every DB
// connection attempt hang for minutes before ever falling back to the IPv4
// address that actually works. Forcing IPv4-first fixes it at the source
// instead of retrying around a connection that was never going to succeed in
// time.
dns.setDefaultResultOrder("ipv4first");

app.listen(env.PORT, () => {
  logger.info(`Barangay Catarman backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
});

// Without this, any uncaught synchronous error anywhere in the app (a bug in
// a route handler, a bad third-party call, etc.) kills the whole Node
// process immediately — which is what caused the backend to silently stop
// listening on port 5000 with no warning. Logging and staying alive turns a
// full outage into a recoverable error.
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
});
