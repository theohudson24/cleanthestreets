# CleanTheStreets

CleanTheStreets is a full-stack urban safety reporting platform for logging, mapping, and tracking potholes and road hazards. The application supports authenticated community reporting, persistent PostgreSQL-backed data storage, an interactive Leaflet/OpenStreetMap interface, profile/report history views, and a leaderboard designed to encourage civic engagement.

This project was built as a UCSC team project and is structured as a production-style Next.js application with API routes serving as the backend.

## Features

- User account creation, sign-in, sign-out, and secure session cookies
- Authenticated report submission with issue type, severity, coordinates, address, description, and optional images
- Interactive map powered by Leaflet and OpenStreetMap
- Report filtering by category and status
- User profile with contribution statistics and report history
- Gamified leaderboard based on submitted reports
- Admin-capable report status moderation
- PostgreSQL persistence through Prisma ORM
- CSRF protection, input validation, password hashing, and rate limiting
- Docker Compose setup for one-command local full-stack startup

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Next.js 15 App Router, Tailwind CSS |
| Backend | Next.js API routes, Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Cookie-based sessions, bcrypt password hashing |
| Maps | Leaflet, React Leaflet, OpenStreetMap |
| Media | Cloudinary signed uploads |
| Tooling | Docker Compose, ESLint, Prisma Migrate |

## Architecture

CleanTheStreets is a monolithic full-stack Next.js application:

- `src/app` contains pages and API routes.
- `src/components` contains reusable UI components.
- `src/lib` contains backend helpers for authentication, security, Prisma, validation, reports, and Cloudinary.
- `prisma/schema.prisma` defines the persistent data model.
- `prisma/migrations` stores versioned database migrations.
- `docker-compose.yml` starts the application and database together.

The backend is implemented through Next.js API routes under `src/app/api`. These routes use Prisma to read and write data in PostgreSQL.

## Data Model

The Prisma schema currently defines:

- `User`: authenticated accounts with profile fields and roles.
- `Session`: hashed session tokens for secure cookie authentication.
- `Report`: submitted road hazards with coordinates, status, category, severity, and owner.
- `ReportImage`: optional image metadata linked to reports.

## Quick Start With Docker Compose

This is the recommended way to run the full application locally. It starts both the frontend/backend app and PostgreSQL.

### Prerequisites

- Docker Desktop
- Git

### Run The App

From the `cleanthestreets` project directory:

```bash
docker compose up --build
```

After the first build, future starts can usually use:

```bash
docker compose up
```

Then open:

```text
http://localhost:3000
```

When the app container starts, it automatically:

1. Waits for PostgreSQL to become healthy.
2. Runs `prisma migrate deploy`.
3. Runs the idempotent seed script.
4. Starts the Next.js production server on port `3000`.

### Docker Commands

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f db
docker compose down
```

To remove the local database volume and reset all local Docker data:

```bash
docker compose down -v
```

## Local Development Without Containerizing The App

Use this flow if you want hot reload with `npm run dev` while still using Docker for PostgreSQL.

### Prerequisites

- Node.js 18 or newer
- npm
- Docker Desktop

### Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

For local development, the database URL should point to the host-mapped Postgres port:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cleanthestreets_dev"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_UPLOAD_FOLDER="cleanthestreets/reports"
```

Cloudinary values are only required for signed image uploads. Core account, map, report, profile, and leaderboard workflows can be tested without image upload configuration.

### Install And Start

```bash
npm install
npm run db:up
npm run db:test
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

## Seeded Accounts

The seed script creates local test accounts:

| Role | Email | Password |
| --- | --- | --- |
| User | `test@test.com` | `test12345` |
| Admin | `admin@test.com` | `admin12345` |

These accounts are for local development only.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Start a production build locally |
| `npm run lint` | Run Next.js linting |
| `npm run db:up` | Start the PostgreSQL Docker service |
| `npm run db:down` | Stop Docker Compose services |
| `npm run db:test` | Verify database connectivity |
| `npm run prisma:migrate` | Apply Prisma migrations in development |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:seed` | Seed local users and sample data |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run smoke:local` | Run the local backend smoke test |

## API Overview

| Route | Purpose |
| --- | --- |
| `GET /api/auth/csrf` | Issue CSRF token |
| `POST /api/auth/signup` | Create account |
| `POST /api/auth/signin` | Sign in |
| `POST /api/auth/signout` | Sign out |
| `GET /api/auth/session` | Return current session user |
| `GET /api/reports` | List reports with filters and pagination |
| `POST /api/reports` | Create authenticated report |
| `GET /api/reports/[id]` | Fetch report details |
| `PATCH /api/reports/[id]` | Update report details or status |
| `DELETE /api/reports/[id]` | Delete authorized report |
| `GET /api/me/reports` | List reports for current user |
| `GET /api/profile` | Fetch current user's profile and stats |
| `PATCH /api/profile` | Update current user's profile |
| `GET /api/leaderboard` | Return ranked contributors |
| `POST /api/uploads/signature` | Create signed Cloudinary upload parameters |

## Security Notes

- Passwords are hashed with bcrypt before storage.
- Session cookies are HTTP-only and store random session tokens, while only token hashes are persisted.
- Mutating API routes require CSRF validation.
- Zod schemas validate request bodies and query parameters.
- Rate limiting is applied to sensitive actions such as sign-in, sign-up, report creation, and profile updates.
- Real credentials should never be committed. Keep `.env.local` private.

## Testing

Run the full backend smoke test against a running local app:

```bash
npm run smoke:local
```

The smoke test verifies:

- CSRF bootstrap and enforcement
- Signup and session creation
- Profile fetch, update, and validation
- Report creation, validation, update, and listing
- User-specific report history
- Leaderboard access
- Ownership and admin authorization rules
- Signout and session clearing
- Rate limiting

## Database Inspection

Open Prisma Studio:

```bash
npm run prisma:studio
```

Or connect directly to the Dockerized database:

```bash
docker compose exec db psql -U postgres -d cleanthestreets_dev
```

Useful SQL:

```sql
\dt
SELECT * FROM "User";
SELECT * FROM "Report";
SELECT * FROM "ReportImage";
SELECT * FROM "Session";
```

## Project Structure

```text
cleanthestreets/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── scripts/
│   ├── local-smoke-test.js
│   ├── prisma-cli.js
│   └── test-db-connection.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── map/
│   │   ├── profile/
│   │   ├── report/
│   │   ├── signin/
│   │   └── signup/
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── styles/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Deployment Notes

For production deployment:

- Use a managed PostgreSQL database and set `DATABASE_URL`.
- Configure Cloudinary credentials for image uploads.
- Run Prisma migrations during deployment with `prisma migrate deploy`.
- Use HTTPS so secure cookies and browser geolocation work correctly.
- Store secrets in the deployment platform's environment variable manager.

## License

This project was created for academic/team portfolio use. Add a license before distributing or accepting external contributions.
