import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS generations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        ip_address VARCHAR(45),
        city VARCHAR(100),
        country VARCHAR(100),
        phrase TEXT NOT NULL,
        subtitle TEXT,
        media_type VARCHAR(50),
        vibe TEXT,
        movie_genre VARCHAR(50),
        flyer_style TEXT,
        scent_style TEXT,
        image_url TEXT,
        replicate_url TEXT
      )
    `;

    // Add scent_style column if it doesn't exist (for existing tables)
    await sql`
      ALTER TABLE generations ADD COLUMN IF NOT EXISTS scent_style TEXT
    `;

    // Track which image model produced each row (e.g. recraft-v4, gpt-image-2)
    await sql`
      ALTER TABLE generations ADD COLUMN IF NOT EXISTS model_used VARCHAR(50)
    `;

    // Job tracking for async polling (mobile background support)
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'pending',
        result_url TEXT,
        error_msg TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Database init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database", details: String(error) },
      { status: 500 }
    );
  }
}
