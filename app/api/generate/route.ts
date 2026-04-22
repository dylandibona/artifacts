import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { sql } from "@vercel/postgres";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe: rawVibe, movieGenre, flyerStyle, scentStyle, modelChoice } = await request.json();
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
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        const vinylRealism = "Shot on expired Polaroid film, soft focus, faded warm colors, slight chemical bloom and visible grain. An amateur snapshot from someone's record collection — not a magazine spread.";
        const vinylLocation = pickRandom([
          "in a thrift store record bin, other records visible",
          "in a dusty crate at a record store, ring wear on sleeve",
          "on the shag carpet of a hippie's living room beside a turntable, rolling papers, a full ashtray, and a half-rolled joint scattered nearby"
        ]);
        prompt = `A handheld snapshot of a vinyl record sleeve ${vinylLocation}, casually framed, slightly tilted, surroundings visible.
The album title "${phrase}" is on the cover.
The cover art style is ${vibe}.
The sleeve has ring wear and soft creased corners.
${vinylRealism}`;
        break;

      case "Gig Flyer":
        const flyerRealism = "Shot on expired 35mm color film, harsh flash, high contrast, gritty street photography aesthetic.";
        const flyerLocation = pickRandom([
          "wheat-pasted at eye level on a crumbling brick wall among other weathered and torn flyers, layers of ripped paper showing decades of past shows underneath",
          "stapled to a telephone pole at night under a streetlamp, dozens of rusty staples and paper scraps from old flyers crusting the wood, a crumpled beer can at the base",
          "thumbtacked to a cluttered coffee shop bulletin board overlapping with missing-cat posters, roommate-wanted ads, zine announcements, and indie band stickers",
          "taped inside the front window of an independent record store next to faded past-show posters and a neon OPEN sign"
        ]);
        const styleToUse = flyerStyle || vibe || "bold graphic design";
        prompt = `A photograph of a letter-sized concert flyer (roughly 8.5×11 inches, paper-sized) ${flyerLocation}.
The flyer announces the band "${phrase}" in prominent lettering.
Poster design style: ${styleToUse}.
The paper is weathered with torn edges and visible wear.
${flyerRealism}`;
        break;

      case "VHS Tape":
        const vhsRealism = "Shot with on-camera flash, harsh shadows, red-eye era snapshot from 1988. Fujifilm drugstore print with rounded corners.";
        const vhsLocation = pickRandom([
          "stacked among other VHS tapes in a thrift store bin",
          "on a crowded video rental shelf, other VHS spines visible",
          "in a \"$1 VHS\" cardboard box at a garage sale, other cassettes visible",
          "on a cluttered coffee table"
        ]);
        prompt = `A close-up snapshot of a rectangular VHS cardboard slipcase (paperback-sized, portrait orientation) ${vhsLocation}.
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

      case "Eau de Toilet":
        const scentVisuals: Record<string, string> = {
          "seductive and sensual": "Warm low light, deep jewel tones, close intimate framing. Soft deep shadows. The image feels like it's about to whisper something.",
          "fresh and clean": "Bright natural light, cool whites and pale aquas, clean minimal environment. Crisp morning air feel.",
          "dark and mysterious": "Single dramatic light source cutting through near-total darkness. Deep cool shadows, smoke or mist, nothing fully revealed.",
          "bold and powerful": "Hard directional light, high contrast, saturated color. Strong geometric composition. No apologies.",
          "1970s American glamour": "Rugged, earthy, independent. Wide open spaces energy. Masculine without trying. The American West filtered through a cologne ad.",
          "unhinged over-the-top luxury": "Baroque excess. Every surface is gilded or encrusted. Maximalist to the point of absurdity. Too much of everything, on purpose.",
          "department store elegance": "Clean professional lighting on white or cream. Tasteful, safe, and a little boring in the best possible way. Nordstrom in 1991.",
          "gas station bathroom chic": "A fragrance brand that desperately wants to be luxury but isn't quite pulling it off. The ambition is there. The execution is not. Available where fine truck stop gifts are sold.",
          "old money sophistication": "Muted natural light filtering through heavy drapes. Aged wood, worn leather, nothing new. Understated to the point of arrogance.",
          "flashy new money": "Everything is shiny. Oversaturated color, high gloss surfaces, chrome and mirror. The lighting is too much. The bottle is too much. Perfect.",
          "coastal grandmother aesthetic": "Soft diffused light, linen textures, whitewashed surfaces. Sea glass color palette. A bottle you'd find on a windowsill next to a shells collection.",
          "divorced dad energy": "Wood-paneled wall, beige carpet, a folding table. Maybe a can of something in the background. Shot like it's a Super Bowl ad anyway.",
          "night out on the town": "Neon reflections, wet pavement bokeh, nighttime city glow. The bottle looks like it just got out of a cab.",
          "the morning after": "Harsh cool daylight, rumpled surfaces, slightly disheveled environment. Beautiful and a little rough.",
        };
        const labelDesign = pickRandom([
          `The label features "${phrase}" in tall elegant serif lettering, gold foil stamped on heavy cream paper with a fine border`,
          `The fragrance name "${phrase}" etched directly into the glass in an exquisite custom script, catching light at the edges`,
          `"${phrase}" appears in bold minimalist sans-serif, debossed into a matte lacquer panel on the bottle face`,
          `The label is a small precious rectangle of black with "${phrase}" in raised gold lettering, bordered by a hairline rule`,
          `"${phrase}" rendered in a dramatic high-contrast serif, silk-screened directly onto the glass in platinum ink`,
          `A handsome typographic label: "${phrase}" set in stacked all-caps with generous letterspacing, printed on vellum`,
          `The bottle carries "${phrase}" in an ornate Art Nouveau script, surrounded by fine decorative flourishes, embossed in gold`,
          `"${phrase}" set in a single oversized word in clean modernist type, cut into frosted glass like a nameplate`
        ]);
        // scentStyle visual brief commented out — relying on phrase + vibe
        // const visualBrief = scentStyle && scentVisuals[scentStyle] ? `${scentVisuals[scentStyle]}\n` : "";
        prompt = vibe
          ? `A cologne and perfume bottle advertisement shot with the visual energy of: ${vibe}.
The bottle is a sculptural object — dramatic in shape, filled with richly colored liquid. It demands attention.
${labelDesign}.
Beautiful lighting, shallow depth of field, the bottle in sharp focus. Unapologetically pretentious. Takes itself deadly seriously.
No advertising copy or text other than the fragrance name on the bottle.`
          : `A luxury cologne and perfume bottle advertisement. Extravagant, over-the-top, and unapologetically pretentious.
The bottle is a sculptural object — dramatic in shape, filled with richly colored liquid. It demands attention.
${labelDesign}.
Shot as a high-end fragrance campaign: fashion photography, beautiful lighting, shallow depth of field, the bottle in sharp focus.
This takes itself deadly seriously.
No advertising copy or text other than the fragrance name on the bottle.`;
        break;

      default:
        const defaultRealism = "Vintage photograph with film grain and slightly faded colors.";
        prompt = `A close-up photo of a vintage object labeled "${phrase}".
The design style is ${vibe}.
${defaultRealism}`;
    }

    // Generate image based on user's model choice
    // "xi" (Node Ξ) = Recraft V4 via Replicate, "null" (Node ∅) = gpt-image-2 via OpenAI
    let replicateUrl: string;
    let modelUsed = modelChoice === "xi" ? "recraft-v4" : "gpt-image-2";

    const runRecraft = async () => {
      const output = await replicate.run("recraft-ai/recraft-v4", {
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
        }
      });
      return Array.isArray(output) ? output[0] : String(output);
    };

    const runGptImage = async () => {
      const result = await openai.images.generate({
        model: "gpt-image-2",
        prompt: prompt,
        size: "1024x1024",
        n: 1,
      });
      const first = result.data?.[0];
      if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
      if (first?.url) return first.url;
      throw new Error("gpt-image-2 returned no image data");
    };

    try {
      if (modelChoice === "xi") {
        replicateUrl = await runRecraft();
      } else {
        replicateUrl = await runGptImage();
      }
    } catch (primaryError) {
      console.error(`${modelUsed} failed, falling back to other model:`, primaryError);
      // Fallback to the other model
      modelUsed = modelChoice === "xi" ? "gpt-image-2" : "recraft-v4";
      if (modelChoice === "xi") {
        replicateUrl = await runGptImage();
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
        INSERT INTO generations (ip_address, city, country, phrase, subtitle, media_type, vibe, movie_genre, flyer_style, scent_style, image_url, replicate_url, model_used)
        VALUES (${ipAddress}, ${city}, ${country}, ${phrase}, ${subtitle || null}, ${mediaType}, ${vibe || null}, ${movieGenre || null}, ${flyerStyle || null}, ${scentStyle || null}, ${cloudinaryUrl}, ${replicateUrl}, ${modelUsed})
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
