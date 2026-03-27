# Free Deployment Checklist

This checklist is for deploying the project safely on free-tier services while keeping setup simple and admin-friendly.

Status key:

- `[ ]` not started
- `[x]` complete

## 1. Choose Free Hosting

- [x] Use `Vercel` for the Next.js app
- [x] Use `Supabase` for free PostgreSQL
- [x] Keep `Cloudinary` free tier for images

## 2. Prepare The Repo

- [x] Confirm `.env.local` is not committed
- [x] Confirm `.env.example` only has placeholders
- [ ] Push the latest secure version to GitHub
- [x] Make sure `npm run build` passes before deploying

## 3. Create Production Services

- [ ] Create a Vercel account
- [ ] Create a Supabase database
- [ ] Create a Cloudinary account or production project
- [ ] Save all production credentials somewhere secure

## 4. Add Production Environment Variables

- [ ] Add `DATABASE_URL` in Vercel
- [ ] Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] Add `CLOUDINARY_API_KEY`
- [ ] Add `CLOUDINARY_API_SECRET`
- [ ] Add `CLOUDINARY_UPLOAD_FOLDER`
- [ ] Double check no secret is stored in a `NEXT_PUBLIC_*` variable except the Cloudinary cloud name

## 5. Deploy The App

- [ ] Import the GitHub repo into Vercel
- [ ] Connect the production branch
- [ ] Run the first deployment
- [ ] Run Prisma migrations against production
- [ ] Confirm the app boots successfully

## 6. Test The Live App

- [ ] Test sign up
- [ ] Test sign in
- [ ] Test sign out
- [ ] Test report creation
- [ ] Test profile update
- [ ] Test leaderboard
- [ ] Test image upload
- [ ] Test session persistence after refresh

## 7. Admin-Friendly Setup

- [ ] Create one production admin account manually
- [ ] Verify the admin can update report statuses
- [ ] Write down the login and recovery process for admins
- [ ] Add a simple deployment notes doc for teammates
- [ ] Add a rollback note for how to redeploy a previous Vercel build

## 8. Free-Tier Safety Checks

- [ ] Monitor database storage limits
- [ ] Monitor Cloudinary upload and storage usage
- [ ] Avoid large test uploads in production
- [ ] Back up production data regularly, even on the free tier

## 9. Next Improvements After Deployment

- [ ] Replace in-memory rate limiting with Redis or Upstash if the app gets real users
- [ ] Add error monitoring such as Sentry
- [ ] Add CI checks for build, migrations, and smoke tests

## Recommended Free Stack

- App hosting: `Vercel`
- Database: `Supabase`
- Image hosting: `Cloudinary`

## Current Choice

- Hosting selected on 2026-03-27: `Vercel + Supabase + Cloudinary`
- Current active deployment milestone: `Step 3. Create Production Services`

## Resume Stack Correction

For this project, `Express.js` should be removed from the stack description because the backend uses Next.js API routes rather than an Express server.

More accurate stack options:

- Full version: `React, Next.js, Node.js, Prisma, PostgreSQL, Leaflet.js, OpenStreetMap, Tailwind CSS, Cloudinary, Docker`
- Short version: `React, Next.js, Node.js, PostgreSQL, Prisma, Leaflet.js/OpenStreetMap, Tailwind CSS`
