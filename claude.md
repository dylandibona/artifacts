# The Artifacts

AI-powered retro media artwork generator. Creates nostalgic mockups of vinyl records, VHS tapes, books, cassette tapes, concert flyers, and perfume bottles using AI image models.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Vercel Postgres
- **AI Models**: Replicate (Recraft V4), OpenAI (gpt-image-2)
- **Image Storage**: Cloudinary
- **Deployment**: Vercel

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Required in `.env.local`:

```
REPLICATE_API_TOKEN=     # Recraft V4 via Replicate
OPENAI_API_KEY=          # gpt-image-2 via OpenAI
OPENAI_ORG_ID=           # OpenAI org ID (required to avoid 403s on gpt-image-*)
CLOUDINARY_CLOUD_NAME=   # Image storage
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
POSTGRES_URL=            # Database connection
```

## Project Structure

```
/app
├── page.tsx                      # Main generation form UI
├── layout.tsx                    # Root layout with fonts
├── globals.css                   # Styles, animations, theme
├── /api
│   ├── /generate/route.ts        # Image generation endpoint
│   ├── /status/[jobId]/route.ts  # Job polling endpoint
│   └── /admin/
│       ├── /login/route.ts       # Admin auth
│       └── /init-db/route.ts     # DB schema setup
├── /admin
│   ├── page.tsx                  # Admin dashboard
│   └── /login/page.tsx           # Admin login
/middleware.ts                    # Route protection for /admin
/public/sounds/                   # Audio assets
```

## Key Files

- `app/page.tsx` - Main client component with generation form, polling logic, Web Notifications, Polaroid animation overlay
- `app/api/generate/route.ts` - Core API: builds prompts, calls AI models, uploads to Cloudinary, logs to Postgres
- `app/api/status/[jobId]/route.ts` - Polls job completion status from the `jobs` table
- `middleware.ts` - Protects admin routes via cookie-based auth
- `app/globals.css` - Custom animations (`eject`, `develop`), retro color palette, font setup

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Generate artifact image |
| `/api/status/[jobId]` | GET | Poll job status (pending / done / failed) |
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/init-db` | GET | Initialize database schema |

### POST /api/generate

Request body:
```json
{
  "phrase": "string",
  "mediaType": "Book|Vinyl Record|VHS Tape|Cassette Tape|Gig Flyer|Eau de Toilet",
  "vibe": "string",
  "modelChoice": "xi|null",
  "jobId": "string (UUID, generated client-side)",
  "subtitle": "string (optional, Book and Eau de Toilet only)",
  "movieGenre": "string (optional, VHS Tape only)",
  "flyerStyle": "string (optional, Gig Flyer only)"
}
```

Response differs by model:
- **Node Ξ (Recraft)**: returns `{ url: "<cloudinary_url>" }` after Cloudinary upload
- **Node ∅ (gpt-image-2)**: returns `{ url: "<base64_data_url>" }` immediately; Cloudinary upload and DB logging happen via `after()` in the background

### GET /api/status/[jobId]

Returns `{ status: "pending" | "done" | "failed", url?: string, error?: string }`.
The `url` for a done gpt-image-2 job is the permanent Cloudinary URL (set once background upload finishes).

## Database Schema

### `generations` table
Stores completed generation metadata:
- User inputs (phrase, media_type, vibe, subtitle, movie_genre, flyer_style, scent_style)
- Generated URLs (image_url = Cloudinary, replicate_url = source)
- Model used (model_used: "recraft-v4" | "gpt-image-2")
- Geolocation (ip_address, city, country)
- Timestamps

### `jobs` table
Tracks in-flight and completed jobs for the polling architecture:
- `id TEXT PRIMARY KEY` — UUID generated client-side
- `status TEXT` — "pending" | "done" | "failed"
- `result_url TEXT` — Cloudinary URL once complete
- `error_msg TEXT`
- `created_at TIMESTAMP`

Initialize both tables via `/api/admin/init-db`. **Must be run after any fresh deploy or schema change.**

## Architecture Notes

**AI Models**:
- "Node Ξ" = Recraft V4 (`recraft-ai/recraft-v4`) via Replicate — fast (~10–20s)
- "Node ∅" = gpt-image-2 (`gpt-image-2`) via OpenAI — thoughtful (~30–60s)

**Image Generation Flow (Node Ξ / Recraft)**:
1. Client generates UUID job ID, starts polling `/api/status/[jobId]` every 4s
2. POST to `/api/generate` — server inserts job as "pending"
3. Calls Recraft V4 via Replicate → temporary URL
4. Uploads to Cloudinary → permanent URL
5. Logs to `generations`, updates job to "done" with Cloudinary URL
6. Returns `{ url: cloudinaryUrl }` to client
7. Client (fetch path or poll path) displays image, plays sound, fires Web Notification

**Image Generation Flow (Node ∅ / gpt-image-2)**:
1. Client generates UUID job ID, starts polling `/api/status/[jobId]` every 4s
2. POST to `/api/generate` — server inserts job as "pending"
3. Calls gpt-image-2 → b64_json (~30–60s)
4. **Returns `{ url: dataUrl }` immediately** (base64 data URL — no Cloudinary wait)
5. `after()` callback runs in background: uploads to Cloudinary, logs to `generations`, updates job to "done" with Cloudinary URL
6. Client (fetch path) gets image without waiting for Cloudinary
7. Polling clients (mobile-backgrounded) get the Cloudinary URL once background work finishes

**Mobile / Background Resilience**:
- iOS Safari suspends JS when the user switches apps, which kills long-running fetches
- The polling architecture ensures the result is always retrievable: the Vercel function keeps running even after client disconnect, writes the result to the `jobs` table, and the client picks it up on the next poll cycle after returning to the browser
- Web Notifications are requested on first generate — fires a system notification when done (Android/desktop native; iOS requires the site to be installed as a PWA)

**State Management**: React hooks. `localStorage` persists the submitter name across sessions.

**Completion handling** in `page.tsx`:
- `startPolling(jobId, phrase)` — polls every 4s, calls `handleGenerationComplete` on success
- `handleGenerationComplete(url, phrase)` — guarded by `completionHandledRef` to prevent double-fire from fetch + poll racing
- `stopPolling()` — clears interval; called on completion, error, and component unmount

## Development Guidelines

- Main UI is a single client component — keep form logic in `app/page.tsx`
- Prompt templates in `/api/generate/route.ts` use `pickRandom()` for variety
- Animations defined in `globals.css` — `eject` for Polaroid slide-in, `develop` for image reveal
- Admin dashboard at `/admin` requires login first
- `maxDuration = 300` on the generate route — gpt-image-2 routinely takes 30–60s

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```
