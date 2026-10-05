# Barangay Catarman — Digital Barangay Operations Management System

A frontend-only, production-quality UI prototype of a Digital Barangay Operations Management System, built for **Barangay Catarman**. This is a **prototype**: there is no backend, database, or real authentication server. All data lives in a fake, seeded "database" (typed TypeScript/JSON files) and all CRUD operations are simulated with client-side state, persisted to `localStorage` via Zustand so changes survive a page refresh.

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- Zustand (+ `persist` middleware) for the fake database / CRUD layer
- React Hook Form + Zod for forms and validation
- TanStack Table (data tables) and TanStack Query
- Framer Motion for animation
- Recharts for dashboard charts
- Leaflet / react-leaflet for the incident location picker
- qrcode.react for QR codes on resident IDs and certificates
- react-hot-toast for notifications

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whichever port you pass, e.g. `npm run dev -- -p 3210`).

### Demo accounts

Staff/Admin login is at `/login`. All seeded accounts share one password:

```
Password: Catarman@2026
```

See `data/generated/staff.json` (or the login page itself) for the list of seeded emails — one `Administrator` account and several `Staff` accounts with different positions.

## Regenerating fake data

The seed data under `data/generated/*.json` is produced deterministically (fixed seed) by a Node script using `@faker-js/faker`. To regenerate it:

```bash
node scripts/generate-seed.mjs
```

This regenerates residents, households, officials, staff, certificate requests, complaints, blotters, announcements, activity logs, and notifications. The typed wrappers in `data/*.ts` import this JSON directly.

## Project Structure

```
app/
  (public)/            Landing page + public resident services (no login required)
  login/               Staff/Administrator login
  dashboard/           Staff & Admin console (protected client-side by auth store)
    (admin)/           Admin-only routes (Staff Accounts, Settings, Backup, Logs)
components/
  ui/                  shadcn/ui primitives
  shared/              Reusable app-wide components (DataTable, StatusBadge, CameraCapture, ...)
  public/              Landing page navbar/footer/sections
  dashboard/           Sidebar, topbar, charts, per-module dialogs/forms
data/                  Typed fake "database" + seed generator output
lib/stores/            Zustand stores — the CRUD layer over the fake database
types/                 Shared TypeScript domain types
```

## What's simulated vs. real

- **Real**: all UI interactions, client-side validation, routing, camera capture (`getUserMedia`), file reading (`FileReader` → data URLs), printable certificate/resident templates, QR codes, dark mode, charts computed from live store state, activity logging.
- **Simulated (no network calls)**: authentication (checked against the seeded staff list), email sending (logged to the console instead), SMTP/backup/restore (toast-confirmed, no real files), PDF/Excel export buttons on the Blotter module (UI only, per spec).

## Notes for connecting a real backend later

Every Zustand store in `lib/stores/` exposes the exact CRUD surface a REST API would need (e.g. `submitPublicRequest`, `updateStatus`, `addResident`). Swapping the fake-database seed calls for `fetch`/React Query calls inside those actions is the intended integration point.
