import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { sql } from "@vercel/postgres";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe: rawVibe, movieGenre, flyerStyle, modelChoice } = await request.json();
    const vibe = rawVibe ? rawVibe.replace(/,\s*/g, " and ") : "";

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    // Extract IP and location from headers (Vercel provides these)
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const rawCity = request.headers.get("x-vercel-ip-city");
    const rawCountry = request.headers.get("x-vercel-ip-country");
    const city = rawCity ? decodeURIComponent(rawCity) : null;
    const country = rawCountry ? decodeURIComponent(rawCountry) : null;

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    let prompt = "";

    switch (mediaType) {
      case "Book":
        const bookRealism = "Shot on expired Polaroid film, creamy faded colors, soft focus, warm yellow cast. Found photograph aesthetic from someone's personal collection.";
        const bookSub = subtitle ? ` Subtitle: "${subtitle}"` : "";
        const bookLocation = pickRandom([
          "on a table at an estate sale",
          "in a thrift store bin",
          "displayed in a dusty bookstore window",
          "on a shelf at a used bookstore"
        ]);
        const bookFormat = pickRandom([
          "hardcover book",
          "paperback book",
          "book with a dust jacket"
        ]);
        prompt = `A close-up photo of a ${bookFormat} ${bookLocation}.
The book title "${phrase}" is on the cover.${bookSub}
The cover design style is ${vibe}.
The book is slightly worn and aged.
${bookRealism}`;
        break;

      case "Vinyl Record":
        const vinylRealism = "Shot on Kodachrome 64, warm saturated colors, slight yellow cast from aged slide film. Looks like a photo from a 1970s magazine.";
        const vinylLocation = pickRandom([
          "in a thrift store record bin, other records visible",
          "in a dusty crate at a record store, ring wear on sleeve",
          "on the floor near a turntable, rolling papers nearby"
        ]);
        prompt = `A close-up photo of a vinyl record sleeve ${vinylLocation}.
The album title "${phrase}" is on the cover.
The cover art style is ${vibe}.
The sleeve has ring wear and soft creased corners.
${vinylRealism}`;
        break;

      case "Gig Flyer":
        const flyerRealism = "Shot on Ilford HP5 pushed to 1600, high contrast black and white, harsh flash, gritty street photography aesthetic.";
        const flyerLocation = pickRandom([
          "stapled to a telephone pole at night, shot with flash",
          "wheat-pasted on a crumbling brick wall",
          "pinned to a cluttered coffee shop bulletin board"
        ]);
        const styleToUse = flyerStyle || vibe || "bold graphic design";
        prompt = `A photograph of a concert flyer ${flyerLocation}.
The poster announces the band "${phrase}" in prominent lettering.
Poster design style: ${styleToUse}.
The paper is weathered with torn edges and visible wear.
${flyerRealism}`;
        break;

      case "VHS Tape":
        const vhsRealism = "Shot with on-camera flash, harsh shadows, red-eye era snapshot from 1988. Fujifilm drugstore print with rounded corners.";
        const vhsLocation = pickRandom([
          "in a thrift store bin with other tapes",
          "on a dusty shelf at a video rental store",
          "in a cardboard box at a garage sale",
          "on a cluttered coffee table"
        ]);
        prompt = `A close-up photo of a VHS tape in its cardboard sleeve ${vhsLocation}.
The movie title "${phrase}" is on the cover.
The cover art depicts an over-the-top ${movieGenre} with dramatic poses.
The cover art style is ${vibe}.
The sleeve is worn with creased edges and faded colors.
${vhsRealism}`;
        break;

      case "Cassette Tape":
        const cassetteRealism = "Shot on cheap 110 film from the 1980s, soft focus, muted colors with magenta tint, slight vignetting. Disposable camera snapshot from a junk drawer.";
        const cassetteLocation = pickRandom([
          "sitting on the dusty dashboard of an old car",
          "lying on a cluttered bedroom floor with other tapes",
          "in a thrift store display case"
        ]);
        prompt = `A close-up photograph of a retail music cassette tape case ${cassetteLocation}.
The hinged clear plastic case shows a colorful J-card insert with professional album cover artwork.
The album title "${phrase}" is prominently displayed on the front cover art.
The cover art style is ${vibe}.
The plastic case has light scratches and wear from use.
A small price sticker is visible on the case.
${cassetteRealism}`;
        break;

      default:
        const defaultRealism = "Vintage photograph with film grain and slightly faded colors.";
        prompt = `A close-up photo of a vintage object labeled "${phrase}".
The design style is ${vibe}.
${defaultRealism}`;
    }

    // Generate image with Replicate based on user's model choice
    // "xi" (Node Ξ) = Recraft V3, "null" (Node ∅) = Ideogram V3
    let replicateUrl: string;
    let modelUsed = modelChoice === "xi" ? "recraft-v3" : "ideogram-v3";

    const runRecraft = async () => {
      const output = await replicate.run("recraft-ai/recraft-v3", {
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          style: "realistic_image",
        }
      });
      return Array.isArray(output) ? output[0] : String(output);
    };

    const runIdeogram = async () => {
      const output = await replicate.run("ideogram-ai/ideogram-v3-quality", {
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          style_type: "Realistic",
          magic_prompt_option: "Off"
        }
      });
      return Array.isArray(output) ? output[0] : String(output);
    };

    try {
      if (modelChoice === "xi") {
        replicateUrl = await runRecraft();
      } else {
        replicateUrl = await runIdeogram();
      }
    } catch (primaryError) {
      console.error(`${modelUsed} failed, falling back to other model:`, primaryError);
      // Fallback to the other model
      modelUsed = modelChoice === "xi" ? "ideogram-v3" : "recraft-v3";
      if (modelChoice === "xi") {
        replicateUrl = await runIdeogram();
      } else {
        replicateUrl = await runRecraft();
      }
    }

    console.log(`Image generated with ${modelUsed}`);

    // Upload to Cloudinary for permanent storage
    let cloudinaryUrl = replicateUrl; // fallback to replicate URL if upload fails
    try {
      const uploadResult = await cloudinary.uploader.upload(replicateUrl, {
        folder: "artifacts",
        resource_type: "image",
      });
      cloudinaryUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload failed, using Replicate URL:", uploadError);
    }

    // Log to database (non-blocking - don't fail the request if DB is unavailable)
    try {
      await sql`
        INSERT INTO generations (ip_address, city, country, phrase, subtitle, media_type, vibe, movie_genre, flyer_style, image_url, replicate_url)
        VALUES (${ipAddress}, ${city}, ${country}, ${phrase}, ${subtitle || null}, ${mediaType}, ${vibe || null}, ${movieGenre || null}, ${flyerStyle || null}, ${cloudinaryUrl}, ${replicateUrl})
      `;
    } catch (dbError) {
      console.error("Database logging failed:", dbError);
    }

    return NextResponse.json({ url: cloudinaryUrl });

  } catch (error) {
    console.error("Error generating image:", error);
    // @ts-ignore
    const errorMessage = error?.response?.data?.detail || error?.message || "Failed to generate";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
