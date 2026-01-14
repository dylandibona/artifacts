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
        image_url TEXT,
        replicate_url TEXT
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
