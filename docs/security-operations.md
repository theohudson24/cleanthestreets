# Security Operations Notes

This document records the backend security controls currently in place and the operational steps required to keep them safe when the project is shared or deployed.

## Current Controls

- Session cookies are `HttpOnly`, `Secure` in production, `SameSite=Lax`, and high priority.
- A separate CSRF cookie and `x-csrf-token` header are required for mutating requests.
- The backend validates auth, profile, report, leaderboard, and query payloads with Zod.
- Report ownership is server-derived from the session and not accepted from the client.
- Report update and delete actions are restricted to the report owner or an admin.
- Report status changes are restricted to admins.
- Signup, signin, profile updates, report creation, report mutation, and upload signing are rate limited.
- Cloudinary upload signatures are server-generated and locked to:
  - a fixed upload folder
  - image-only uploads
  - a 5 MB max file size
  - JPG, JPEG, PNG, and WebP formats
- Baseline security headers are applied globally in `next.config.mjs`.
- Security-relevant failures such as CSRF rejection, forbidden mutations, failed signins, and rate-limit hits are logged in structured server logs.

## Secrets Handling

- Keep real secrets only in local `.env.local` or production environment-variable storage.
- Commit only placeholder values in `.env.example`.
- Never paste live database URLs, Cloudinary secrets, or session secrets into source files, docs, screenshots, or pull requests.
- If a secret is exposed:
  - rotate it immediately in the provider dashboard
  - replace it in local/prod environment settings
  - remove it from Git history if it was ever committed

## Startup And Verification

Use this order locally:

```bash
npm run db:up
npm run db:test
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run dev
```

Inspect the database with:

```bash
npm run prisma:studio
```

Run the backend verification suite against a running dev server with:

```bash
npm run smoke:local
```

## Backups And Recovery

For production, the database should have scheduled backups outside the app process. At minimum:

1. Use managed Postgres backups if your provider supports them.
2. If self-hosting Postgres, schedule regular `pg_dump` exports.
3. Store backups in a separate location from the app server.
4. Test restoration periodically, not just backup creation.

Example manual backup command:

```bash
pg_dump "$DATABASE_URL" > cleanthestreets-backup.sql
```

Example restore command:

```bash
psql "$DATABASE_URL" < cleanthestreets-backup.sql
```

## Remaining Operational Note

The current rate limiter uses in-memory storage, which is acceptable for a single local/dev instance and a small single-instance deployment. For horizontally scaled production, move rate limiting to a shared store such as Redis so limits are enforced across all app instances.
