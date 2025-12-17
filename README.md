# CleanTheStreets

A Next.js application that allows users to report and view urban safety issues (like potholes and road hazards) on an interactive map.

## Features

- **Interactive Map**: Built with Leaflet.js to display all reported hazards with markers and popups
- **Report Submission**: Users can submit reports with photos, descriptions, and automatic location capture
- **Real-time Updates**: Map automatically refreshes to show new reports
- **Cloudinary Integration**: Image upload support for report photos
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Cloudinary account (for image uploads)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up Cloudinary (optional for MVP - image upload will work with configuration):

   - Create a free account at [Cloudinary](https://cloudinary.com)
   - Go to Settings > Upload > Upload presets
   - Create a new unsigned upload preset named `cleanthestreets`
   - Copy your Cloud Name from the dashboard

3. Create a `.env.local` file in the root directory by copying `.env.example` and filling in local values (DO NOT commit `.env.local`):

```bash
cp .env.example .env.local
# then edit .env.local to set values such as DATABASE_URL
```

4. Start the local Postgres database (Docker Compose):

```bash
npm run db:up
```

5. Test the DB connection and apply Prisma migrations (first-time setup):

```bash
npm run db:test       # checks the DATABASE_URL can connect
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed   # optional: seed sample data
npx prisma studio     # inspect data in a GUI
```

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── reports/          # API routes for reports
│   ├── map/                   # Map page
│   ├── report/                # Report submission page
│   ├── layout.js              # Root layout with navigation
│   └── page.js                # Home page
├── components/
│   ├── Map.js                 # Leaflet map component
│   ├── ReportForm.js          # Report submission form
│   └── navigatiorbar.js       # Navigation bar
└── styles/
    └── globals.css            # Global styles
```

## Usage

1. **View the Map**: Navigate to `/map` to see all reported issues
2. **Report an Issue**:
   - Go to `/report`
   - Fill out the form with issue type, description, and optional photo
   - Click "Capture My Location" or allow browser location access
   - Submit the report
3. **View Reports**: Click on any marker on the map to see report details

## API Routes

The app includes API routes at `/api/reports`:

- `GET /api/reports` - Fetch all reports
- `POST /api/reports` - Create a new report

**Note**: The API is now backed by **Postgres + Prisma** for persistent storage in local development. See the "Database (Postgres + Prisma)" steps above to set up a local database. For production, configure a managed Postgres instance and set `DATABASE_URL` accordingly.

## Technologies

- **Next.js 15** - React framework
- **React 19** - UI library
- **Leaflet.js** - Interactive maps
- **Tailwind CSS** - Styling
- **Cloudinary** - Image hosting
- **Postgres + Prisma** - Local database and ORM for persistent storage (dev)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Security & Secrets ⚠️

- Keep any real credentials out of the repository. Create a local `.env.local` from `.env.example` and never commit it.
- If you accidentally committed a `.env` file with secrets, remove it from the repository history or at minimum untrack it locally:

```bash
# stop tracking the file (keeps the file locally)
git rm --cached .env
git commit -m "remove tracked .env"
```

- Make sure `.env*` and other local runtime files are ignored (this repo already includes `.env*` patterns in `.gitignore`).

## Deploy on Vercel

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
