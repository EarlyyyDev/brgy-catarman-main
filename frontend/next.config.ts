import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  /* Proxies /api/* to the backend server-side, so the browser only ever
   * talks to this Next.js origin -- required for phone/LAN/tunnel testing,
   * where the browser can't reach "localhost:5000" (that's the phone's own
   * loopback, not the dev machine's) and a second cross-origin tunnel would
   * need CORS + cross-site cookie changes just to test locally. */
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      // Uploaded resident/complaint/certificate photos are stored as
      // relative "/uploads/..." URLs and served by the backend's static
      // file middleware -- proxy them the same way as /api so they resolve
      // against this origin instead of 404ing.
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
  /* Silences the dev-only cross-origin warning when loading the site from a
   * device other than this machine (phone over LAN, or an ngrok tunnel). */
  allowedDevOrigins: ["192.168.254.136", "*.ngrok-free.app", "*.ngrok-free.dev"],
  experimental: {
    /* Every request (including file uploads) passes through the /api/*
     * rewrite above, which Next.js treats as a middleware-layer proxy --
     * that layer silently truncates request bodies over 10MB by default,
     * independent of whatever limit the backend's own multer config sets
     * per-route. Next.js requires a finite number here (must validate as
     * > 0) but enforces no upper bound, and Infinity itself satisfies that
     * check cleanly -- effectively removes this layer's cap entirely. */
    middlewareClientMaxBodySize: Infinity,
  },
};

export default nextConfig;
