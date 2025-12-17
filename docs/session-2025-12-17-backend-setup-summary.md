# Session: Backend setup & cleanup — 2025-12-17

Summary of work completed and important notes to resume later.

## Quick status ✅

- Postgres local (Docker) set up via `docker-compose.yml`.
- Prisma schema & migrations applied; Prisma client generated.
- Seed script fixed and made idempotent + now hashes passwords (bcryptjs).
- Reports API routes updated to use Prisma (DB-backed GET/POST and GET by id).
- Auth API updated to use Prisma + bcrypt (signup/signin use DB and hashed passwords).
- `.env.example` added; `.env` removed from repo; `.env.local` used for local settings and ignored.
- README updated with DB + Prisma setup steps and security notes.

## Files changed (key)

- Added: `docker-compose.yml`, `.env.example`, `docs/session-2025-12-17-backend-setup-summary.md`
- Modified:
  - `prisma/seed.js` (made idempotent, bcrypt hashed password)
  - `src/lib/prisma.js` (prisma client helper)
  - `src/app/api/reports/route.js` and `src/app/api/reports/[id]/route.js`
  - `src/app/api/auth/signup/route.js` and `src/app/api/auth/signin/route.js` (Prisma + bcrypt)
  - `scripts/test-db-connection.js`, `scripts/verify-seed.js`
  - `README.md` (.env and DB setup docs)
  - `package.json` (scripts + bcryptjs installed)

## Commands you ran/should run locally

- Start Postgres:
  - npm run db:up
- Check DB connection:
  - npm run db:test
- Migrate & generate Prisma client:
  - npx prisma generate
  - npx prisma migrate dev --name init
- Seed DB (idempotent):
  - npm run prisma:seed
- Verify seed:
  - node ./scripts/verify-seed.js
- Run dev server:
  - npm run dev

## Security notes

- `.env.local` should contain `DATABASE_URL` and other secrets; **do not commit** `.env.local`.
- If any real secrets were previously committed, rotate them and remove them from history.

## Next steps to implement (comprehensive & prioritized)

Below is a detailed, prioritized checklist of backend work to complete for production readiness. Each item includes a short description and a suggested first step.

### High priority (must-have before production) ✅

1. **Authentication & session management** (NextAuth or custom httpOnly cookie sessions)

   - Description: Replace the current mock token flows with secure session creation, refresh/rotation, and logout. Ensure sessions are stored either in a server-side store (Redis) or keep short-lived JWTs with refresh tokens.
   - First step: Pick NextAuth or implement a session table + secure cookies; write integration tests for signin/signup flows.

2. **Email verification & password recovery**

   - Description: Add verified email flag, send verification emails, and implement password reset flows.
   - First step: Integrate an email provider (SendGrid, Mailgun) and add the verification token workflow.

3. **Input validation & sanitization** (Zod)

   - Description: Validate all API inputs (reports, auth, uploads) and surface clear errors; sanitize text to avoid XSS.
   - First step: Add `zod` schemas and middleware or utility wrappers for route handlers.

4. **Authorization & roles**

   - Description: Enforce role-based access (admin, moderator, user), e.g., report moderation, delete/flag content.
   - First step: Add `role` field to `User` model and create guard middleware with tests.

5. **Rate limiting & abuse protection**

   - Description: Protect endpoints with per-IP/user limits (signups, report creation) using Redis or in-process middleware.
   - First step: Add a middleware using Upstash/Redis or a managed rate limiter and block suspicious activity.

6. **Secure file uploads (signed direct uploads)**

   - Description: Use signed client-side uploads to Cloudinary/S3, validate images server-side, store image metadata (ReportImage).
   - First step: Implement server-side signing endpoint and update `Report` creation flow to accept signed upload metadata.

7. **Database hardening & geospatial**

   - Description: Add PostGIS (if geospatial queries are needed), add indexes for common queries, implement connection pooling (PgBouncer), and set up regular DB backups.
   - First step: Add extension setup steps to Docker Compose and create an initial geospatial index migration.

8. **Testing & CI**

   - Description: Add unit, integration, and E2E tests; add CI workflow that runs migrations, seeds, and tests on PRs; fail PRs on test/lint failures.
   - First step: Add GitHub Actions (or preferred CI) job that runs `npx prisma migrate deploy` on a throwaway DB, seeds, and runs test suite.

9. **Secrets & environment management**

   - Description: Use a secret manager for production env vars; ensure `.env.local` is ignored and rotate any previously committed secrets.
   - First step: Add docs to README and add checks to CI to prevent pushing `.env` files.

10. **Security hardening**

    - Description: Add HTTP security headers, CORS rules, CSRF protections, secure cookie flags (`HttpOnly`, `Secure`, `SameSite`), and script-level rate limits.
    - First step: Add middleware to implement headers and CSRF token checks for non-GET requests.

11. **Logging & error monitoring**

    - Description: Integrate structured logging and an error tracker (Sentry). Capture request context, user id, and breadcrumbs.
    - First step: Add Sentry SDK and a basic logger that writes structured logs to the console and a file/managed logging sink.

12. **Backups & monitoring**
    - Description: Set up automated DB backups and monitoring for DB size, slow queries, and availability.
    - First step: Add a scheduled backup and DB alerts in your hosting platform or via scripts.

### Medium priority (important but can follow) ⚙️

- **Background jobs & worker queue** (image processing, notifications) — BullMQ/Redis or cloud tasks
- **Caching & CDNs** (Redis cache for heavy queries, Cloudflare or similar for static assets)
- **Pagination, filtering & efficient indexes** (cursor-based pagination for large sets)
- **Admin/moderation UI** (for content review, user bans)
- **Performance profiling & DB query optimization** (identify slow queries, add indexes)

### Low priority (nice-to-have / future) 🧭

- **Search & analytics** (Elasticsearch / Meilisearch, analytics dashboards)
- **Multitenancy or org-level scoping**
- **GDPR & data-privacy features** (data export, deletion endpoints, audit logs)

---

## How I can help next

- Implement one top-priority item (auth sessions, signed uploads, or CI/tests) end-to-end and add tests and docs. Tell me which I should start with and I will create a scoped plan and PR.

---

If you want the full chat transcript saved instead of this summary, I can add it as a separate file (larger). Tell me which you'd prefer.

Saved on: 2025-12-17
Saved by: GitHub Copilot
