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

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=cleanthestreets
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

**Note**: The current implementation uses in-memory storage. For production, connect to a database.

## Technologies

- **Next.js 15** - React framework
- **React 19** - UI library
- **Leaflet.js** - Interactive maps
- **Tailwind CSS** - Styling
- **Cloudinary** - Image hosting

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.