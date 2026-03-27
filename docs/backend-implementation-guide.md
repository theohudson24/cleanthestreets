# Backend Implementation Guide

This document explains the backend of the CleanTheStreets application from the ground up. It is written for someone who has not seen the project before and needs enough context to understand how the backend works, how data moves through the system, and where to make changes safely.

## 1. What This Backend Is

CleanTheStreets is a Next.js application that uses:

- Next.js App Router for both frontend pages and backend API routes
- Prisma as the ORM
- PostgreSQL as the database
- Cloudinary for image storage
- Cookie-based sessions for authentication

There is no separate Express server and no separate backend service. The backend lives inside the Next.js project under `src/app/api/...`.

That means:

- Pages and API routes are part of the same app
- Authentication, database access, and validation all run on the Next.js server
- The browser talks to backend endpoints like `/api/auth/signin` and `/api/reports`

## 2. High-Level Backend Responsibilities

The backend currently handles:

- user sign up
- user sign in
- user sign out
- current session lookup
- profile fetch and profile update
- report creation
- report listing and filtering
- individual report fetch
- report update and delete
- per-user report listing
- leaderboard aggregation
- signed Cloudinary upload signature generation
- session security
- CSRF protection
- request validation
- basic rate limiting
- authorization checks

## 3. Core Architecture

The main backend building blocks are:

- Prisma schema: [schema.prisma](/Users/theohudson/Documents/vsprojects/cleanthestreets/prisma/schema.prisma)
- Prisma client: [prisma.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/prisma.js)
- auth/session helpers: [auth.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/auth.js)
- security helpers: [security.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/security.js)
- validation schemas: [validation.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/validation.js)
- upload helpers: [cloudinary.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/cloudinary.js)
- report serialization/authorization helpers: [reports.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/reports.js)
- API routes: `src/app/api/**`

## 4. Services Used In This Project

This section explains every important service or platform used by the backend, what it is, how it works at a practical level, and what its job is in this project.

### 4.1 Next.js

What it is:

- a React framework that can render pages and run backend code

How it works here:

- frontend pages live under `src/app/...`
- backend API routes live under `src/app/api/...`
- when the browser requests `/api/...`, Next.js runs the corresponding server code

Its job in this project:

- serves the application
- runs backend routes
- handles page rendering
- lets the frontend and backend live in one codebase

Why it matters:

- this is the runtime shell of the entire project
- there is no separate Express backend

### 4.2 Node.js

What it is:

- the JavaScript runtime that executes the server-side code

How it works here:

- Next.js API routes execute inside Node.js
- Prisma CLI scripts, seed scripts, and local tooling also run in Node.js

Its job in this project:

- runs server-side logic
- runs database scripts
- runs local test and build scripts

### 4.3 Prisma

What it is:

- an ORM that translates JavaScript/TypeScript-style queries into SQL

How it works here:

- the data model is written in [schema.prisma](/Users/theohudson/Documents/vsprojects/cleanthestreets/prisma/schema.prisma)
- Prisma generates a client library
- backend routes call `prisma.user.findUnique()`, `prisma.report.create()`, and similar methods

Its job in this project:

- defines the database structure
- creates and runs migrations
- provides safe, structured database access from backend routes
- keeps application code from manually writing most SQL

Why it matters:

- if you change the database structure, Prisma is usually the first place you change it

### 4.4 PostgreSQL

What it is:

- the relational database that stores the real application data

How it works here:

- Prisma connects to PostgreSQL using `DATABASE_URL`
- tables hold users, sessions, reports, and report images

Its job in this project:

- stores persistent backend data
- keeps data available between app restarts
- supports filtering, aggregation, sessions, and ownership relationships

Why it matters:

- this is the real source of truth for the app’s data

### 4.5 Docker

What it is:

- a container platform used to run local services consistently

How it works here:

- local Postgres runs in a Docker container using [docker-compose.yml](/Users/theohudson/Documents/vsprojects/cleanthestreets/docker-compose.yml)

Its job in this project:

- gives the team a shared local database setup
- avoids requiring everyone to install and configure Postgres manually

Why it matters:

- Docker is for local development convenience, not the app’s business logic

### 4.6 Cloudinary

What it is:

- a cloud media storage and delivery service

How it works here:

- users upload report images to Cloudinary
- the backend creates signed upload parameters
- Cloudinary stores the real image files
- the app stores returned image metadata in the database

Its job in this project:

- stores report photos
- serves image URLs
- keeps large file storage out of the app server and database

Why it matters:

- the database stores image references and metadata, not the binary files themselves

### 4.7 Browser Cookies

What they are:

- small pieces of data stored in the browser and automatically sent to the server

How they work here:

- one cookie stores the session token
- one cookie stores the CSRF token

Their job in this project:

- maintain login state
- support secure cookie-based authentication
- support CSRF protection

Why they matter:

- this backend uses cookie sessions rather than localStorage-based auth

### 4.8 Zod

What it is:

- a schema validation library

How it works here:

- backend routes validate incoming JSON bodies and query parameters with Zod schemas

Its job in this project:

- rejects invalid input before it reaches business logic
- centralizes validation rules
- helps reduce injection, malformed payloads, and inconsistent route behavior

### 4.9 bcrypt

What it is:

- a password hashing library

How it works here:

- passwords are hashed with bcrypt before being stored
- sign-in compares the submitted password with the stored hash

Its job in this project:

- prevents plain-text password storage
- makes stolen password databases much less immediately useful

### 4.10 OpenStreetMap and Leaflet

What they are:

- OpenStreetMap provides the map data
- Leaflet renders the interactive map in the browser

How they work here:

- the frontend map page loads map tiles and places report markers
- the backend provides the report data those markers use

Their job in this project:

- they are part of the user experience, not the backend data layer
- they matter because many backend responses are designed specifically to support the map UI

### 4.11 Vercel

What it is:

- a hosting platform commonly used to deploy Next.js apps

How it works here:

- for deployment, Vercel will run the Next.js app and API routes

Its job in this project:

- hosts the application
- serves frontend pages
- runs backend API routes in production

Why it matters:

- Vercel is the planned production runtime platform for the app

### 4.12 Supabase

What it is:

- a hosted backend platform that includes managed PostgreSQL

How it works here:

- the project can use Supabase primarily as a managed Postgres provider
- Prisma connects to the Supabase Postgres database just like any other Postgres instance

Its job in this project:

- provides the production database
- gives a free-tier hosted Postgres option for deployment

Important note:

- this project does not currently use Supabase Auth or Supabase client features
- in this setup, Supabase’s main role is managed PostgreSQL hosting

## 5. Database Model

The database is defined in [schema.prisma](/Users/theohudson/Documents/vsprojects/cleanthestreets/prisma/schema.prisma).

### 4.1 User

The `User` model stores:

- `id`: primary key
- `email`: unique login identity
- `passwordHash`: bcrypt-hashed password
- `displayName`
- `avatarUrl`
- `bio`
- `location`
- `role`: `user` or `admin`
- `createdAt`
- `updatedAt`

It also has relations to:

- `reports`
- `sessions`

### 4.2 Report

The `Report` model stores:

- `id`
- `userId`
- `issueType`
- `description`
- `latitude`
- `longitude`
- `status`
- `severity`
- `address`
- `createdAt`
- `updatedAt`

`issueType` is an enum:

- `pothole`
- `damaged_road`
- `debris`
- `signage`
- `other`

`status` is an enum:

- `reported`
- `in_progress`
- `fixed`

This model is indexed for common queries:

- reports by user and date
- reports by status and date
- reports by issue type and date

### 4.3 ReportImage

The `ReportImage` model stores:

- `id`
- `reportId`
- `url`
- `publicId`
- `width`
- `height`
- `format`
- `bytes`
- `createdAt`

This allows the backend to store more than just a plain image URL. It preserves enough metadata to manage uploads later if needed.

### 4.4 Session

The `Session` model stores:

- `id`
- `sessionTokenHash`
- `userId`
- `expiresAt`
- `createdAt`

Important detail:

- the raw session token is never stored in the database
- only a SHA-256 hash of the token is stored

That means if the sessions table were ever exposed, attackers would not immediately get usable raw session tokens.

## 6. Prisma Client

The Prisma client is defined in [prisma.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/prisma.js).

It uses a singleton pattern so the app does not create too many Prisma connections during development. This is standard for Next.js projects using Prisma.

All database access in backend routes goes through this Prisma client.

## 7. Environment Variables

The backend depends on these main environment variables:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER`

Local placeholders are defined in [/.env.example](/Users/theohudson/Documents/vsprojects/cleanthestreets/.env.example).

Important rules:

- `.env.local` is for real local secrets and should never be committed
- only `NEXT_PUBLIC_*` values are safe for client exposure
- do not put actual secrets in source files or docs

## 8. Local Backend Startup

The backend can be started locally with:

```bash
npm run db:up
npm run db:test
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run dev
```

Supporting files:

- Docker database config: [docker-compose.yml](/Users/theohudson/Documents/vsprojects/cleanthestreets/docker-compose.yml)
- Prisma CLI env loader: [prisma-cli.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/scripts/prisma-cli.js)
- seed script: [seed.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/prisma/seed.js)

The seed script creates:

- a normal test user: `test@test.com`
- an admin user: `admin@test.com`
- a sample report

These are local/dev credentials only.

## 9. Authentication and Sessions

Authentication is implemented with custom session logic in [auth.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/auth.js).

### 8.1 How Sign In Works

`POST /api/auth/signin` does the following:

1. Requires a valid CSRF token
2. Validates request shape with Zod
3. Applies rate limiting
4. Loads the user by email
5. Compares the password with the stored bcrypt hash
6. Creates a new session row in the database
7. Sets the session cookie
8. Returns the public user payload

Route file:

- [signin route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signin/route.js)

### 8.2 How Sign Up Works

`POST /api/auth/signup` does the following:

1. Requires a valid CSRF token
2. Validates request shape
3. Applies rate limiting
4. Checks whether the email already exists
5. Hashes the password with bcrypt
6. Creates the user
7. Creates a session
8. Sets the session cookie
9. Returns the public user payload

Route file:

- [signup route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signup/route.js)

### 8.3 How Session Lookup Works

`GET /api/auth/session`:

- reads the session cookie
- loads the session from the database
- rejects expired sessions
- returns the logged-in user in a public-safe shape

Route file:

- [session route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/session/route.js)

### 8.4 How Sign Out Works

`POST /api/auth/signout`:

- requires CSRF
- deletes the session row from the database
- clears the session cookie
- clears the CSRF cookie

Route file:

- [signout route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signout/route.js)

### 8.5 Cookie Design

The backend uses two cookies:

- `cleanthestreets_session`
- `cleanthestreets_csrf`

Session cookie settings:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production
- `priority=high`

CSRF cookie settings:

- not `HttpOnly` because the browser must read it and mirror it into a header
- `SameSite=Strict`
- `Secure` in production

## 10. CSRF Protection

CSRF protection is implemented in [security.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/security.js) and [csrf route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/csrf/route.js).

### 9.1 Why It Exists

The app uses cookie authentication. Any cookie-based backend must defend against cross-site request forgery on mutating requests.

### 9.2 How It Works

For `POST`, `PUT`, `PATCH`, and `DELETE`:

- the route checks the request `Origin`
- the route checks the CSRF cookie
- the route checks the `x-csrf-token` header
- the header value must match the cookie value

If any of those checks fail, the request is rejected with `403`.

### 9.3 Client Helper

Client-side code uses [client/csrf.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/client/csrf.js).

`apiFetch()` does two things:

- fetches a CSRF token if the browser does not already have one
- automatically attaches `x-csrf-token` for mutating requests

This is the wrapper used in the frontend for authenticated mutations.

## 11. Validation

Validation is centralized in [validation.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/validation.js).

This file defines Zod schemas for:

- sign in
- sign up
- profile update
- report creation
- report update
- reports query params
- leaderboard query params
- my reports query params
- report ID params

### 10.1 Why Centralized Validation Matters

This avoids:

- duplicated validation rules
- inconsistent limits between routes
- trusting client-controlled payloads

If you want to change the allowed maximum profile bio length, report description length, file count, or similar rules, this is the first place to update.

## 12. Security Helpers

Security support lives in [security.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/security.js).

This file provides:

- CSRF token creation and verification
- same-origin checks
- rate limiting
- safe JSON error responses
- validation error handling
- structured security logging

### 11.1 Rate Limiting

The current rate limiter is an in-memory `Map`.

It is applied to:

- sign in
- sign up
- profile update
- report create
- report update
- report delete
- upload signature generation

This is good for local development and single-instance deployment, but for multi-instance production it should be replaced with a shared store such as Redis or Upstash.

### 11.2 Security Logging

The backend logs security-relevant events such as:

- sign-in failures
- duplicate sign-up attempts
- CSRF failures
- forbidden report update/delete attempts
- rate-limit hits

Sensitive values are redacted before logging.

## 13. Report Helpers

[reports.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/reports.js) contains two small but important helpers:

- `serializeReport(report)`
- `canManageReport(user, report)`

`serializeReport()` reshapes report image data into:

- `imageUrl`
- `imageUrls`

This keeps frontend consumption simple.

`canManageReport()` defines the core authorization rule:

- admins can manage any report
- a normal user can manage only their own report

## 14. API Routes

This section explains what each API route does.

### 14.1 `GET /api/auth/csrf`

File:

- [auth/csrf route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/csrf/route.js)

Purpose:

- issues a CSRF token if none exists
- returns the existing token otherwise

### 14.2 `GET /api/auth/session`

File:

- [auth/session route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/session/route.js)

Purpose:

- returns the currently authenticated user
- ensures the browser also has a CSRF token

### 14.3 `POST /api/auth/signin`

File:

- [auth/signin route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signin/route.js)

Purpose:

- authenticates a user
- creates a server-side session

### 14.4 `POST /api/auth/signup`

File:

- [auth/signup route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signup/route.js)

Purpose:

- creates a user account
- creates a session immediately after account creation

### 14.5 `POST /api/auth/signout`

File:

- [auth/signout route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signout/route.js)

Purpose:

- invalidates the server-side session
- clears cookies

### 14.6 `GET /api/profile`

File:

- [profile route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/profile/route.js)

Purpose:

- returns the signed-in user’s profile
- includes derived stats such as total reports and fixed rate

### 14.7 `PATCH /api/profile`

Purpose:

- updates the signed-in user’s editable fields
- applies validation, CSRF, and rate limiting

Editable fields:

- `displayName`
- `bio`
- `location`
- `avatarUrl`

### 14.8 `GET /api/reports`

File:

- [reports route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/reports/route.js)

Purpose:

- returns report listings
- supports pagination and filtering

Supported query params:

- `limit`
- `page`
- `issueType`
- `status`
- `mine`

If `mine=true`, the route requires authentication and limits results to the current user.

### 14.9 `POST /api/reports`

Purpose:

- creates a new report
- attaches the report to the current authenticated user

Important detail:

- the client does not provide `userId`
- ownership comes from the session only

### 14.10 `GET /api/reports/[id]`

File:

- [reports id route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/reports/[id]/route.js)

Purpose:

- returns one report with user and image data

### 14.11 `PATCH /api/reports/[id]`

Purpose:

- lets the owner or admin update a report

Allowed editable fields:

- `description`
- `address`
- `severity`
- `issueType`
- `status`

Important rule:

- only admins can change `status`

### 14.12 `DELETE /api/reports/[id]`

Purpose:

- lets the owner or admin delete a report
- deletes related `ReportImage` rows first

### 14.13 `GET /api/me/reports`

File:

- [me reports route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/me/reports/route.js)

Purpose:

- returns reports that belong only to the signed-in user

### 14.14 `GET /api/leaderboard`

File:

- [leaderboard route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/leaderboard/route.js)

Purpose:

- aggregates reports by user
- returns ranked leaderboard entries

Supported period filters:

- `all`
- `week`

### 14.15 `POST /api/uploads/signature`

File:

- [upload signature route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/uploads/signature/route.js)

Purpose:

- returns a signed Cloudinary upload payload for the current user

This route is protected by:

- auth
- CSRF
- rate limiting

It also constrains the upload parameters to:

- fixed folder
- allowed image formats
- max file size
- image-only resource type
- standard upload tag

## 15. Cloudinary Upload Flow

Cloudinary support is defined in [cloudinary.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/cloudinary.js).

The backend does not allow completely free-form direct uploads. Instead:

1. the signed-in browser asks `/api/uploads/signature` for a signature
2. the backend returns signed upload parameters
3. the browser uploads the file directly to Cloudinary
4. the browser sends the resulting image metadata when creating the report
5. the backend stores image metadata in `ReportImage`

This is safer than exposing a loose unsigned upload preset.

## 16. Security Headers

Global security headers are configured in [next.config.mjs](/Users/theohudson/Documents/vsprojects/cleanthestreets/next.config.mjs).

Current headers include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Origin-Agent-Cluster`

These headers reduce common browser-side risks and tighten cross-origin behavior.

## 17. Error Handling Philosophy

Routes use `toErrorResponse()` from [security.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/security.js).

That means:

- validation failures become `400`
- auth failures become `401`
- authorization failures become `403`
- not-found conditions are handled explicitly where needed
- unexpected server errors become generic `500` responses

The backend intentionally avoids returning raw internal error objects to the browser.

## 18. How the Frontend Talks to the Backend

Frontend code uses normal `fetch()` for safe read requests and `apiFetch()` for mutating requests.

Use `apiFetch()` when:

- signing in
- signing up
- signing out
- updating a profile
- creating a report
- updating a report
- deleting a report
- requesting an upload signature

That matters because `apiFetch()` automatically handles CSRF token setup and header attachment.

## 19. Testing and Verification

The main backend verification script is [local-smoke-test.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/scripts/local-smoke-test.js).

It verifies:

- CSRF bootstrap
- sign up
- session lookup
- CSRF rejection when token is missing
- profile fetch
- profile update
- profile validation failure
- report creation
- report validation failure
- report update
- my reports
- public report listing
- leaderboard
- owner/admin authorization
- admin moderation
- sign out
- session invalidation
- rate limiting

Run it with:

```bash
npm run smoke:local
```

## 20. Common Change Scenarios

### 20.1 Add a New Report Field

If you want to add a new field such as `city` or `resolvedAt`, update in this order:

1. [schema.prisma](/Users/theohudson/Documents/vsprojects/cleanthestreets/prisma/schema.prisma)
2. Prisma migration
3. [validation.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/validation.js)
4. relevant API route create/update logic
5. any serializer/helper logic
6. frontend forms/pages

### 20.2 Change Authorization Rules

If you want moderators, municipal roles, or more granular permissions:

1. extend the `UserRole` enum
2. add helper functions in [auth.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/auth.js) or [reports.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/reports.js)
3. update the relevant routes
4. update seed/admin setup if needed

### 20.3 Change Validation Rules

If you need different limits or stricter rules:

- change the Zod schema in [validation.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/validation.js)

This is the correct place to change:

- max bio length
- password rules
- report description length
- image count
- max severity
- supported issue types

### 20.4 Replace the Rate Limiter

If moving to multi-instance production:

1. replace the in-memory storage in [security.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/security.js)
2. keep the same `applyRateLimit()` interface if possible
3. use a shared store such as Redis/Upstash

### 20.5 Add New API Routes

When adding a new route, follow the current backend pattern:

1. validate input with Zod
2. require auth if needed
3. require CSRF for mutating requests
4. add rate limiting for abuse-prone endpoints
5. use Prisma for DB access
6. return generic server errors, not raw stack traces
7. log security-relevant failure cases

## 21. Important Limitations and Known Tradeoffs

The backend is in a strong state for a first production deployment, but there are still deliberate tradeoffs:

- rate limiting is in-memory, not distributed
- there is no password reset flow yet
- there is no email verification flow yet
- there is no dedicated admin dashboard yet
- there is no external monitoring service wired in yet

These are reasonable for an initial launch, but they are the next backend/ops improvements once deployment begins.

## 22. File Map for Backend Work

If you need to work on a specific backend area, start here:

- database schema: [schema.prisma](/Users/theohudson/Documents/vsprojects/cleanthestreets/prisma/schema.prisma)
- Prisma client: [prisma.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/prisma.js)
- auth/session logic: [auth.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/auth.js)
- security logic: [security.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/security.js)
- validation rules: [validation.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/validation.js)
- report helpers: [reports.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/reports.js)
- upload config: [cloudinary.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/cloudinary.js)
- auth API routes: [api/auth](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth)
- profile API route: [api/profile](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/profile/route.js)
- report API routes: [api/reports](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/reports)
- user reports route: [api/me/reports](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/me/reports/route.js)
- leaderboard route: [api/leaderboard](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/leaderboard/route.js)
- upload signing route: [api/uploads/signature](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/uploads/signature/route.js)
- smoke test: [local-smoke-test.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/scripts/local-smoke-test.js)
- deployment/security operations: [security-operations.md](/Users/theohudson/Documents/vsprojects/cleanthestreets/docs/security-operations.md)

## 23. How All Services Work Together In One Request

This section gives concrete end-to-end examples so you can see how the full system behaves during real user actions.

### 23.0 Architecture Diagram

```text
User Browser
  |
  | 1. Loads pages and sends API requests
  v
Next.js App
  |
  |-- Frontend Pages
  |     - renders UI
  |     - collects user input
  |     - calls backend routes
  |
  |-- API Routes
        - auth
        - profile
        - reports
        - leaderboard
        - upload signature
        |
        | uses
        v
  Backend Helper Layer
    - auth.js
    - security.js
    - validation.js
    - reports.js
    - cloudinary.js
        |
        | talks to
        v
  Prisma Client
        |
        | queries
        v
  PostgreSQL Database
    - User
    - Session
    - Report
    - ReportImage

Separate Media Flow:

User Browser
  |
  | requests signed upload parameters from Next.js
  v
Next.js API Route (/api/uploads/signature)
  |
  | signs request using Cloudinary secret
  v
Cloudinary
  |
  | stores image and returns metadata
  v
User Browser
  |
  | sends image metadata with report creation
  v
Next.js API Route (/api/reports)
  |
  v
PostgreSQL stores report + image metadata
```

What this diagram means:

- the browser never talks directly to PostgreSQL
- Prisma is the layer between backend code and the database
- Cloudinary stores the actual images
- PostgreSQL stores structured application data and image metadata
- Next.js is the center of the system because it serves both the frontend and backend
- the helper layer keeps authentication, validation, security, and business logic separated from route files

### 23.1 Example: User Signs In

When a user signs in, the flow looks like this:

1. The browser loads the sign-in page from Next.js.
2. The frontend uses `apiFetch()` from [client/csrf.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/client/csrf.js).
3. If the browser does not already have a CSRF token, it requests `GET /api/auth/csrf`.
4. Next.js runs [auth/csrf route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/csrf/route.js).
5. That route creates a CSRF token and sends it back in a cookie.
6. The browser submits `POST /api/auth/signin` with:
   - the email and password in JSON
   - the session-related cookies
   - the `x-csrf-token` header
7. Next.js runs [signin route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/auth/signin/route.js).
8. `security.js` checks:
   - same-origin policy
   - CSRF token match
   - rate limiting
9. `validation.js` verifies the payload shape.
10. Prisma uses PostgreSQL to load the user record by email.
11. `bcrypt` compares the submitted password against `passwordHash`.
12. If valid, `auth.js` creates a random session token.
13. `auth.js` hashes that token and Prisma stores the hash in PostgreSQL.
14. The raw session token is set in the browser as the session cookie.
15. The frontend receives the signed-in user payload and redirects the user.

Services involved:

- Next.js
- Node.js
- browser cookies
- Zod
- Prisma
- PostgreSQL
- bcrypt

### 23.2 Example: User Creates a Report Without Images

When a signed-in user submits a report with no image:

1. The browser loads the report page.
2. The user fills in issue type, description, location, and severity.
3. The frontend calls `POST /api/reports` using `apiFetch()`.
4. The request includes:
   - JSON report data
   - session cookie
   - CSRF header
5. Next.js runs [reports route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/reports/route.js).
6. `auth.js` resolves the current user from the session cookie.
7. `security.js` enforces:
   - authentication
   - CSRF
   - rate limiting
8. `validation.js` checks the report payload:
   - valid issue type
   - valid coordinates
   - valid severity
   - allowed text lengths
9. Prisma writes the report to PostgreSQL.
10. The route returns the created report.
11. The frontend redirects to the success page.

Important detail:

- the browser does not choose `userId`
- the backend attaches the user from the session

Services involved:

- Next.js
- Node.js
- browser cookies
- Zod
- Prisma
- PostgreSQL

### 23.3 Example: User Creates a Report With Images

When the user uploads report images, the flow is slightly longer:

1. The user selects image files in the browser.
2. The frontend calls `POST /api/uploads/signature`.
3. Next.js runs [upload signature route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/uploads/signature/route.js).
4. The route checks:
   - user is signed in
   - CSRF is valid
   - request is not rate limited
5. `cloudinary.js` creates a signed Cloudinary upload payload.
6. The backend returns:
   - cloud name
   - API key
   - folder
   - allowed formats
   - max file size
   - timestamp
   - signature
7. The browser uploads the file directly to Cloudinary.
8. Cloudinary stores the file and returns metadata such as:
   - `secure_url`
   - `public_id`
   - image size
   - format
9. The browser then sends `POST /api/reports` with the normal report payload plus the returned image metadata.
10. Prisma stores the `Report` row and related `ReportImage` rows in PostgreSQL.

Why this design matters:

- the app server does not need to store large image binaries
- uploads are constrained and signed
- the database stores only the metadata needed to render and manage the uploaded images

Services involved:

- Next.js
- Node.js
- Cloudinary
- browser cookies
- Zod
- Prisma
- PostgreSQL

### 23.4 Example: Admin Updates a Report Status

When an admin changes a report from `reported` to `fixed`:

1. The admin opens a report detail page.
2. The frontend loads current session data from `/api/auth/session`.
3. The frontend shows status controls only if the current user is an admin.
4. The admin submits a `PATCH /api/reports/[id]` request.
5. Next.js runs [reports id route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/reports/[id]/route.js).
6. `auth.js` resolves the current user from the session.
7. `security.js` verifies CSRF and rate limiting.
8. `validation.js` verifies the route param and request body.
9. `reports.js` and route logic enforce authorization:
   - owners can edit their own reports
   - only admins can change the `status`
10. Prisma updates the report in PostgreSQL.
11. The updated report is returned to the frontend.

If a normal user tries to change `status`, the route rejects the request with `403`.

Services involved:

- Next.js
- Node.js
- browser cookies
- Zod
- Prisma
- PostgreSQL

### 23.5 Example: User Views the Leaderboard

When the leaderboard page loads:

1. The frontend requests `GET /api/leaderboard`.
2. Next.js runs [leaderboard route](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/api/leaderboard/route.js).
3. `validation.js` checks the query params such as `period` and `limit`.
4. Prisma runs a grouped aggregation query on PostgreSQL.
5. PostgreSQL counts reports per user.
6. Prisma loads the associated user display data.
7. The route maps that data into a ranked leaderboard payload.
8. The frontend renders the leaderboard.

Services involved:

- Next.js
- Node.js
- Prisma
- PostgreSQL

### 23.6 Example: What Happens When a Malicious Request Is Sent

Suppose an attacker sends a forged request to update a profile or create a report:

1. The request reaches the Next.js API route.
2. `security.js` checks the request origin.
3. It checks whether the CSRF cookie and `x-csrf-token` header exist and match.
4. If they do not match, the backend returns `403`.
5. If the request payload is malformed, `validation.js` rejects it with `400`.
6. If the request is repeated too often, rate limiting returns `429`.
7. If the attacker tries to change someone else’s report, authorization logic returns `403`.
8. A security log entry is emitted with redacted details.

This is how the different protection layers work together:

- session auth identifies the user
- CSRF protects cookie-based mutations
- validation protects input shape and limits
- authorization protects resource ownership
- rate limiting reduces abuse volume
- logging creates an audit trail for suspicious behavior

## 24. Final Mental Model

The easiest way to think about this backend is:

- Prisma defines the data model
- Next.js API routes are the backend surface
- `auth.js` decides who the user is
- `validation.js` decides what input is allowed
- `security.js` decides whether a request is safe to accept
- route files decide what business operation happens
- Prisma persists the result

If you keep those responsibilities separated when making changes, the backend stays understandable and maintainable.
