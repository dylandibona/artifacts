# Artifacts Project Context

## Admin Access
- **URL**: `/admin`
- **Username**: `dylandibona`
- **Password**: `calliope05`

## Services
- **Image Generation**: User-selectable via toggle
  - **Node Ξ** (left): Recraft V3 - better text rendering, more polished
  - **Node ∅** (right): Ideogram V3 Quality - more creative/unpredictable
  - Falls back to the other model if selected one fails
- **Image Storage**: Cloudinary (25GB free)
- **Database**: Neon Postgres (via Vercel)
- **Hosting**: Vercel

## UI Notes
- Model toggle starts in neutral middle position; generate button disabled until user selects
- Toggle has subtle click sound (Web Audio API, 4ms triangle wave)

## Environment Variables Required
- `REPLICATE_API_TOKEN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `POSTGRES_URL`
