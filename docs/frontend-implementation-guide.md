# Frontend Implementation Guide

This document explains the frontend of the CleanTheStreets application from the ground up. It is written for someone who has never seen the project before and needs a practical understanding of how the UI is structured, how it talks to the backend, and where to make changes safely.

## 1. What The Frontend Is

The frontend is built with:

- React
- Next.js App Router
- Tailwind CSS
- custom global theme styling
- Leaflet for the map UI

The frontend lives mainly in:

- `src/app` for pages
- `src/components` for reusable UI pieces
- `src/styles/globals.css` for global theme and style overrides

This is a single Next.js application, so the frontend and backend live in the same repository and run together.

## 2. Frontend Responsibilities

The frontend is responsible for:

- rendering the public pages
- rendering the authenticated user pages
- collecting form input
- showing reports on the map
- calling backend API routes
- managing client-side loading and error states
- showing report details, filters, stats, and leaderboard content

The frontend does not make final security decisions. It can hide or show controls, but the backend is what actually enforces authentication, authorization, validation, and security rules.

## 3. Core Frontend Architecture

The frontend is split into three main layers:

### 3.1 Page Layer

Pages are route-level UI files inside `src/app`.

Examples:

- [home page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/page.js)
- [map page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/map/page.js)
- [report page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/report/page.js)
- [sign-in page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/signin/page.js)
- [sign-up page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/signup/page.js)
- [profile page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/profile/page.js)
- [leaderboard page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/leaderboard/page.js)
- [issue detail page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/issue/[id]/page.js)

Each page usually does some combination of:

- loading data from an API route
- maintaining local UI state
- composing reusable components
- handling route-specific user interactions

### 3.2 Component Layer

Reusable UI components live in `src/components`.

Examples:

- [navigation bar](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/navigatiorbar.js)
- [footer](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/Footer.js)
- [report form](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/ReportForm.js)
- [map component](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/Map.js)
- [issue card](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/IssueCard.js)
- [filter chips](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/FilterChips.js)
- [empty state](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/EmptyState.js)
- [loading spinner](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/LoadingSpinner.js)
- [status badge](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/StatusBadge.js)

These components help keep page files smaller and make design elements reusable.

### 3.3 Styling Layer

Styling is handled through:

- Tailwind utility classes
- custom CSS variables and overrides in [globals.css](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/styles/globals.css)

This project uses a custom glass-panel / dark-gradient visual language instead of plain Tailwind defaults.

## 4. Global App Shell

The app shell is defined in [layout.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/layout.js).

It provides:

- global metadata
- shared navigation bar
- shared footer
- the page wrapper where all route content renders

The structure is:

```text
RootLayout
  NavigationBar
  main
    current page
  Footer
```

If you want to change something that should appear on every page, this is usually the correct file.

## 5. Visual System

The main visual rules are defined in [globals.css](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/styles/globals.css).

### 5.1 Theme Variables

The CSS variables define:

- background colors
- card colors
- border colors
- text colors
- accent colors
- font fallbacks

These variables make it easier to change the overall theme without rewriting every component.

### 5.2 Global Overrides

The stylesheet also overrides common Tailwind utility classes such as:

- `.bg-white`
- `.bg-gray-50`
- `.bg-gray-100`
- `.text-gray-*`

That means components can still use familiar Tailwind classes, but the app theme reinterprets them to fit the darker glass-panel design.

### 5.3 Shared Utility Styles

The stylesheet defines reusable styles such as:

- `.glass-panel`
- `.glass-input`
- `.glass-chip`
- animation helpers like `.animate-slide-up`

If you want to keep a new component visually consistent, reuse these patterns rather than inventing a completely different visual language.

## 6. Main Pages

### 6.1 Home Page

File:

- [page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/page.js)

Purpose:

- introduces the product
- shows high-level report stats
- gives quick actions to report an issue or open the map
- explains the app’s basic workflow

Key behavior:

- fetches report data from `/api/reports`
- derives simple client-side stats
- supports a map search redirect using query params

### 6.2 Map Page

File:

- [map page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/map/page.js)

Purpose:

- displays reports on an interactive map
- lets users filter by category and status
- shows an issue details drawer when a marker is clicked

Key behavior:

- fetches reports from `/api/reports`
- refreshes periodically
- uses `useSearchParams()` to read the search query
- renders the map through a dynamically imported map component

Important detail:

- the page is wrapped in `Suspense` because `useSearchParams()` requires it in production builds

### 6.3 Report Page

Files:

- [report page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/report/page.js)
- [report form](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/ReportForm.js)

Purpose:

- allows a signed-in user to submit a new issue report

Key behavior:

- collects description, issue type, severity, address, and location
- supports geolocation and manual map click selection
- supports image upload through Cloudinary
- submits the final report to `/api/reports`

### 6.4 Report Success Page

File:

- [success page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/report/success/page.js)

Purpose:

- confirms report creation
- optionally fetches the created report
- provides links to view, share, or navigate back into the app

### 6.5 Sign-In and Sign-Up Pages

Files:

- [sign-in page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/signin/page.js)
- [sign-up page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/signup/page.js)

Purpose:

- collect credentials
- create accounts
- start authenticated sessions

Key behavior:

- use the shared `apiFetch()` client helper for secure mutations
- call backend auth routes
- redirect after success

### 6.6 Profile Page

File:

- [profile page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/profile/page.js)

Purpose:

- shows the signed-in user’s profile
- displays recent reports
- lets the user edit profile fields
- handles signout

Key behavior:

- fetches `/api/profile`
- fetches `/api/me/reports`
- fetches leaderboard data to compute the user’s rank
- sends profile updates with `apiFetch()`

### 6.7 My Reports Page

File:

- [my reports page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/me/reports/page.js)

Purpose:

- lists the signed-in user’s own reports

### 6.8 Leaderboard Page

File:

- [leaderboard page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/leaderboard/page.js)

Purpose:

- shows top contributors
- supports switching between leaderboard periods

### 6.9 Issue Detail Page

File:

- [issue detail page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/issue/[id]/page.js)

Purpose:

- shows one report in detail
- shows images, status, location, and metadata
- lets owners delete reports
- lets admins update report status

## 7. Important Reusable Components

### 7.1 NavigationBar

File:

- [navigatiorbar.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/navigatiorbar.js)

Purpose:

- shows main navigation
- fetches current session state from `/api/auth/session`
- conditionally shows authenticated routes

Important detail:

- this is one of the main frontend consumers of backend auth state

### 7.2 ReportForm

File:

- [ReportForm.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/ReportForm.js)

Purpose:

- contains the main report submission workflow

It handles:

- client-side form state
- geolocation capture
- map location selection
- upload signing request
- file upload to Cloudinary
- secure report submission to the backend

### 7.3 Map

File:

- [Map.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/Map.js)

Purpose:

- displays the interactive map
- shows report markers
- handles marker click callbacks
- supports map click selection for the report form

Why it is dynamically imported:

- Leaflet depends on browser-only behavior and should not render on the server

### 7.4 FilterChips

File:

- [FilterChips.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/FilterChips.js)

Purpose:

- renders reusable chip-style filter controls

### 7.5 EmptyState

File:

- [EmptyState.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/EmptyState.js)

Purpose:

- shows reusable empty or no-results states

### 7.6 StatusBadge

File:

- [StatusBadge.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/StatusBadge.js)

Purpose:

- visually represents report status consistently across the app

### 7.7 IssueCard

File:

- [IssueCard.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/IssueCard.js)

Purpose:

- renders a compact report preview card used in list-style views

### 7.8 LoadingSpinner

File:

- [LoadingSpinner.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/LoadingSpinner.js)

Purpose:

- provides a shared loading indicator

## 8. Frontend Data Flow

The frontend generally follows this request flow:

1. a page or component mounts
2. it fetches from a backend API route
3. it stores response data in local React state
4. it renders the UI from that state
5. when the user submits an action, it sends a mutation request
6. on success, the UI refreshes or redirects

Read requests often use plain `fetch()`.

Mutating requests use `apiFetch()` from [client/csrf.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/client/csrf.js).

That helper:

- ensures a CSRF token exists
- attaches the CSRF header automatically
- keeps browser credentials attached

## 9. How The Frontend Talks To The Backend

The frontend interacts with these important backend routes:

- `/api/auth/csrf`
- `/api/auth/session`
- `/api/auth/signin`
- `/api/auth/signup`
- `/api/auth/signout`
- `/api/profile`
- `/api/reports`
- `/api/reports/[id]`
- `/api/me/reports`
- `/api/leaderboard`
- `/api/uploads/signature`

### 9.1 Read Requests

Examples:

- loading the map
- loading profile data
- loading leaderboard entries
- loading a single issue detail

These are often done with plain `fetch()`.

### 9.2 Mutating Requests

Examples:

- sign in
- sign up
- sign out
- update profile
- create report
- update report
- delete report
- request Cloudinary upload signature

These should go through `apiFetch()` to preserve the security model.

## 10. Authentication State In The Frontend

The app no longer treats `localStorage` as the source of truth for auth.

Instead:

- frontend components call `/api/auth/session`
- the backend decides whether the user is authenticated
- the UI updates based on the returned session user

This is important because:

- the frontend is for presentation
- the backend is the real authority

## 11. Image Upload UX Flow

Frontend image upload happens in the report form:

1. user selects files
2. frontend asks the backend for signed upload parameters
3. frontend uploads directly to Cloudinary
4. Cloudinary returns metadata
5. frontend sends that metadata along with the report creation request

This keeps uploads fast and avoids pushing binary files through the app server.

## 12. Error and Loading States

The frontend uses local component state for:

- loading spinners
- inline form errors
- fetch failures
- no-results states
- action status like saving or deleting

Examples:

- map page shows an error toast if report loading fails
- profile page shows form success and form error messages
- issue page shows action errors for failed update/delete actions
- empty states are used when filters produce no results

## 13. Routing and Navigation

Navigation is mainly handled with:

- `Link` for standard route navigation
- `useRouter()` for programmatic navigation
- `useSearchParams()` for query-string-driven behavior
- dynamic route segments like `/issue/[id]`

Important routes:

- `/`
- `/map`
- `/report`
- `/report/success`
- `/signin`
- `/signup`
- `/profile`
- `/me/reports`
- `/leaderboard`
- `/issue/[id]`

## 14. Frontend Services Used In This Project

### 14.1 React

What it does:

- powers the component system
- manages local UI state
- updates the DOM when state changes

### 14.2 Next.js

What it does:

- provides routing
- page structure
- server/client component support
- app layout structure

### 14.3 Tailwind CSS

What it does:

- gives utility classes for layout, spacing, typography, and color

### 14.4 Leaflet

What it does:

- renders the interactive map UI
- places issue markers on the map

### 14.5 OpenStreetMap

What it does:

- provides map tile/data support for the displayed map

### 14.6 Cloudinary

What it does:

- stores uploaded report images
- returns image URLs and metadata for frontend display

### 14.7 Browser APIs

The frontend uses several browser-native APIs:

- `navigator.geolocation` for location capture
- `navigator.clipboard` for share-link copy
- cookies for auth/CSRF handling

## 15. Common Frontend Change Scenarios

### 15.1 Add A New Page

To add a new page:

1. create a new route in `src/app`
2. compose existing reusable components if possible
3. add API calls if needed
4. add links in the navigation if it should be discoverable

### 15.2 Change The Theme

For global visual changes:

1. edit CSS variables in [globals.css](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/styles/globals.css)
2. adjust shared utility classes like `.glass-panel`
3. then tweak individual pages only if needed

### 15.3 Add A New Form Field To Reports

If the backend already supports a field:

1. update [ReportForm.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/ReportForm.js)
2. include it in the request payload
3. update any views that should display it

If the backend does not support the field yet:

- coordinate the change with the backend guide and backend schema first

### 15.4 Change Navigation For Authenticated Users

Edit:

- [navigatiorbar.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/navigatiorbar.js)

That is where the current-user session is read and where nav visibility rules are applied.

### 15.5 Change The Map Filter Experience

Edit:

- [map page](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/map/page.js)
- [FilterChips.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/FilterChips.js)
- [Map.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/Map.js)

## 16. Important Frontend Limitations

Current frontend tradeoffs include:

- some pages still have hook dependency warnings that can be cleaned up later
- some components still use plain `<img>` instead of `next/image`
- loading and error handling are good for MVP use, but could be made more systematic
- there is not yet a dedicated admin dashboard

These are polish opportunities, not blockers for understanding or extending the app.

## 17. File Map For Frontend Work

Start here depending on what you need to change:

- app shell: [layout.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/layout.js)
- global styles: [globals.css](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/styles/globals.css)
- home page: [page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/page.js)
- map page: [map/page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/map/page.js)
- report workflow: [ReportForm.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/ReportForm.js)
- auth pages: [signin/page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/signin/page.js), [signup/page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/signup/page.js)
- profile page: [profile/page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/profile/page.js)
- issue details: [issue/[id]/page.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/app/issue/[id]/page.js)
- navigation: [navigatiorbar.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/navigatiorbar.js)
- map component: [Map.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/components/Map.js)
- frontend secure fetch helper: [client/csrf.js](/Users/theohudson/Documents/vsprojects/cleanthestreets/src/lib/client/csrf.js)

## 18. Final Mental Model

The easiest way to think about the frontend is:

- pages define the user-facing routes
- components provide reusable UI building blocks
- global CSS defines the app’s overall visual language
- pages fetch data from backend API routes
- local React state controls loading, errors, and interactivity
- `apiFetch()` is the safe way to send mutations to the backend

If you keep page responsibilities, component responsibilities, and backend interaction boundaries clean, the frontend stays easy to extend.
