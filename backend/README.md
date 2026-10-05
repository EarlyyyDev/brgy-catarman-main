# Barangay Catarman — Backend API

Express 5 + TypeScript + Prisma (PostgreSQL/Neon) backend for the Digital Barangay Operations Management System.

**The `frontend/` directory was intentionally not touched by this backend build.** The frontend is currently a
self-contained prototype (Zustand stores persisted to IndexedDB, seeded with Faker data) that makes no network
calls — this backend was built to match its type contracts and store CRUD surface so a later frontend-integration
pass can wire real requests in without a mismatched API. No frontend files were modified.

## Stack

- Express 5, TypeScript
- Prisma ORM 6 against Neon serverless PostgreSQL
- JWT access/refresh cookies (httpOnly), refresh-token rotation with reuse detection, CSRF double-submit cookie
- bcryptjs password hashing
- express-validator, express-rate-limit, helmet, multer (disk storage)

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values — see below
npx prisma generate
npx prisma migrate deploy   # or `npm run prisma:migrate` for a dev migration
npm run prisma:seed         # creates essential-only reference data (see Seeding)
npm run dev                 # tsx watch src/server.ts, http://localhost:5000
```

`npm run typecheck` runs `tsc --noEmit`. `npm run build && npm start` builds and runs the compiled server.

## Environment variables

All required vars are validated at boot by `src/config/env.ts` (zod schema) — the server refuses to start if any
are missing/invalid. See `.env.example` for the full annotated list: `DATABASE_URL`/`DIRECT_URL` (Neon pooled +
direct connection strings), `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (32+ char random hex), cookie/CORS settings,
`BCRYPT_SALT_ROUNDS`, `SEED_ADMIN_*` (used only by the seed script), and upload limits.

`.env` is gitignored and must never be committed. `DATABASE_URL` is read only on the server — it is never sent to
the frontend, hardcoded in source, or exposed through any API response.

## Seeding

`prisma/seed.ts` creates only **essential/structural** data, never fake business records:

- 1 Sitio + 6 Puroks (matching the frontend's fixed Purok enum)
- 6 `DocumentType` definitions, 6 default `CertificateTemplate`s, 1 `BlotterTemplate`
- 1 `SystemSettings` singleton row
- 1 Administrator account (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`)

Residents, Households, Officials, EmergencyContacts, Announcements, CertificateRequests, Complaints, Blotters,
Comments, Notifications, and BackupRecords all start empty — every one of those is created through real usage,
never seeded.

## Architecture

Clean layering per domain: `routes/` → `controllers/` → `services/` → `repositories/`, plus `middlewares/`,
`validators/`, `utils/`, `config/`. Every mutating write derives the acting user's identity from the verified
session (`req.user`, attached by `requireAuth`/`optionalAuth`) — never from client-supplied fields. This is what
`src/services/activityLog.service.ts` relies on for every `ActivityLog` row, and what every `processedById` /
`authorId` / `mediatorId` / `triggeredById` foreign key is populated from.

`SAFE_USER_SELECT` (`src/utils/prismaSelectors.util.ts`) must be used for any nested `User` relation include —
a blanket `include: { user: true }` would leak `passwordHash` and password-reset tokens into the API response.

## API surface

All routes are mounted under `/api`. Authenticated routes require the `access_token` httpOnly cookie
(`requireAuth`); admin-only routes additionally require `role: ADMINISTRATOR` (`requireAdmin`). Mutating requests
need the `X-CSRF-Token` header to match the `csrf_token` cookie once a session exists.

| Base path | Access | Covers |
|---|---|---|
| `/api/health` | public | DB connectivity check |
| `/api/auth` | public/auth | login, refresh, logout, logout-all, change-password |
| `/api/users` | admin | staff account CRUD, temporary-password issuance |
| `/api/geography` | auth | Sitios, Puroks |
| `/api/residents` | auth | Resident CRUD, tags |
| `/api/households` | auth | Household CRUD with transactional member sync |
| `/api/document-types` | auth | Document type / fee / requirements config |
| `/api/certificate-templates` | auth | Certificate template CRUD |
| `/api/certificate-requests` | auth | Certificate request workflow, requirements, timeline |
| `/api/complaints` | auth | Complaint intake, status, timeline, incident photos |
| `/api/blotters` | auth | Blotter case CRUD, hearings, history |
| `/api/blotter-templates` | auth | Blotter template CRUD |
| `/api/announcements` | auth | Announcement CRUD, comments/replies/reactions |
| `/api/officials` | auth (write: admin) | Barangay officials directory |
| `/api/emergency-contacts` | auth (write: admin) | Emergency hotline directory |
| `/api/activities` | auth (write: admin) | Upcoming barangay activities/events |
| `/api/settings` | admin | System settings (contact info, branding, SMTP, deadlines) |
| `/api/backups` | admin | Manual backup export/download/restore/delete |
| `/api/notifications` | auth (write: admin) | Dashboard notifications |
| `/api/activity-logs` | admin | Audit log listing (filter by module/actor) |
| `/api/dashboard/stats` | auth | Aggregate counts/breakdowns for dashboard widgets |
| `/api/public` | public | Anonymous certificate/complaint submission + tracking, published announcements + engagement, public officials/emergency-contacts/activities/settings, contact form |

Uploaded files (resident photos, certificate requirements, complaint evidence, announcement attachments) are
served statically from `/uploads`. Backup files are **not** — they live in `backend/backups/` (gitignored,
never mounted on any static route) and can only be reached through the authenticated, admin-only
`/api/backups/:id/download` endpoint, since a backup file contains every user's `passwordHash`.

## Backups

`POST /api/backups` performs a real Prisma-based JSON export of every substantive table (not `pg_dump`, which
isn't available in this environment) to a timestamped file in `backend/backups/`. `POST /api/backups/:id/restore`
wipes and re-populates those same tables from a prior export inside one transaction — this necessarily
invalidates all active sessions (deleting `User` rows cascades to `Session`/`RefreshToken`), so every user is
logged out after a restore and must sign in again. `Session`/`RefreshToken` themselves are intentionally excluded
from backups, since restoring stale auth tokens would be meaningless and a security risk.

## Security notes

- Passwords hashed with bcrypt (`BCRYPT_SALT_ROUNDS`, default 12).
- Access/refresh tokens are httpOnly cookies; refresh tokens rotate on use with reuse detection.
- CSRF protection via double-submit cookie on all mutating requests once a session cookie exists.
- Every `ActivityLog` entry's `actorId`/`actorName`/`actorRole` comes from the authenticated session, never from
  request body — the deliberate fix for actions being mis-attributed to the wrong role.
- `SystemSettings`' SMTP credentials are excluded from the public settings endpoint (`PUBLIC_FIELD_DENYLIST` in
  `settings.service.ts`).
