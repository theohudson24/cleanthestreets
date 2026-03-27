# Backend Completion Checklist

This checklist tracks the backend work needed to move from a local development backend to a user-ready and security-hardened backend.

Status key:

- `[x]` complete
- `[ ]` not started or not complete

## 1. Local Backend Completion

- [x] Set up local Postgres with Docker
- [x] Connect Prisma to local Postgres
- [x] Create and apply initial migrations
- [x] Seed local test data
- [x] Add startup and DB inspection docs
- [x] Remove remaining mock data dependencies from the UI
- [x] Replace mock auth token flow with real server sessions
- [x] Implement `GET /api/profile` from the database
- [x] Implement `POST /api/auth/signout` to actually clear sessions
- [x] Implement `GET /api/me/reports` for the signed-in user
- [x] Replace mock leaderboard data with DB aggregation
- [x] Ensure report creation uses authenticated user from server session
- [x] Add a real `.env.example` template for teammates
- [x] Add local smoke tests for auth, reports, profile, and leaderboard

## 2. User-Ready Backend

- [x] Choose auth approach: Auth.js or custom session table
- [x] Create persistent session model/storage
- [x] Add current-user/session helper on the server
- [x] Update navbar/profile/auth pages to use server auth state
- [x] Add profile update endpoint
- [x] Add ownership rules for user data and reports
- [x] Add report status update flow for admins/moderators
- [x] Add proper pagination/filtering for reports
- [x] Add signed image upload flow instead of temporary direct upload
- [x] Store image metadata properly in the database
- [x] Add user-facing error handling for failed auth/report actions
- [x] Add basic admin/moderation capability if needed for report cleanup

## 3. Security Hardening

- [x] Add Zod validation to every API route
- [x] Stop trusting client-supplied `userId`, `role`, or ownership fields
- [x] Use secure cookie settings: `HttpOnly`, `Secure`, `SameSite`
- [x] Add CSRF protection for cookie-based mutations
- [x] Add rate limiting for signup, signin, report creation, and upload routes
- [x] Lock down Cloudinary uploads with signed uploads or strict presets
- [x] Add authorization guards for profile/report/admin routes
- [x] Reduce internal error leakage in API responses
- [x] Add security headers in Next middleware/config
- [x] Add audit/logging for auth and sensitive actions
- [x] Review `.env`, secrets handling, and credential rotation process
- [x] Add backup and recovery plan for the database
- [x] Add automated tests for auth, authorization, validation, and abuse cases

## Notes

- Section 1 completed locally on 2026-03-27.
- Verification completed with `npm run smoke:local` against a live local dev server.
- Section 2 completed locally on 2026-03-27.
- Section 2 verification included profile updates, report mutation ownership checks, pagination/filtering, and admin moderation.
- Section 3 completed locally on 2026-03-27.
- Section 3 verification included CSRF rejection, request validation, owner/admin authorization checks, signout/session invalidation, and signin rate limiting via `npm run smoke:local`.
- Production verification on 2026-03-27 passed with `npm run build`.
- Push-safety audit on 2026-03-27 confirmed no tracked `.env*` files and no real Cloudinary or database secrets in the repository.
- Dependency audit on 2026-03-27 removed the direct critical Next.js vulnerability by upgrading to `next@15.5.14`; remaining audit findings are transitive development-tooling advisories that require breaking dependency changes and do not affect the production request path.
