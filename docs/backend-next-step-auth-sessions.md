# Backend Next Step: Real Auth Sessions

The current application has a working local database and Prisma setup, but authentication is still only partially real.

## What is already working

- Postgres runs locally through Docker.
- Prisma migrations, generation, and seed scripts work.
- `signup` and `signin` check the database and password hashes.
- Reports are stored in Postgres through Prisma.

## What is still temporary

- Auth routes still return a mock token instead of a real server session.
- The frontend still trusts `localStorage` for signed-in state.
- `profile`, `signout`, and parts of the leaderboard flow are still placeholders or mock-backed.

## Next implementation step

The next backend milestone is to replace the current mock-token flow with a real server-backed session flow.

That means:

1. Add a real session mechanism.
2. Read the current user from the server, not from `localStorage`.
3. Update protected pages and API routes to trust the server session.
4. Stop accepting client-provided identity values like `userId` for ownership-sensitive actions.

## What will change in the application

- `signin` will create a real session instead of returning `mock-token-*`.
- `signout` will actually clear the session.
- `profile` will use the authenticated server user.
- Report creation will attach the current signed-in user from the session.
- Navbar/profile gating will stop depending on browser-only storage.

## Why this is the right next step

Without real session handling, the backend still cannot trust who the current user is. That blocks secure ownership checks, proper authorization, and the later security pass.

## Team startup reminder

Local startup:

```bash
npm run db:up
npm run db:test
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run dev
```

View database data:

```bash
npm run prisma:studio
```
