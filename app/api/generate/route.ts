import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe: rawVibe, movieGenre } = await request.json();
    const vibe = rawVibe ? rawVibe.replace(/,\s*/g, " and ") : "";

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const realism = "Style: Raw amateur photography, realistic texture, film grain, unedited. NOT a render.";

    let prompt = "";

    switch (mediaType) {
      case "Book":
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
${realism}`;
        break;

      case "Vinyl Record":
        const vinylLocation = pickRandom([
          "in a thrift store record bin, other records visible",
          "in a dusty crate at a record store, ring wear on sleeve",
          "on the floor near a turntable, rolling papers nearby"
        ]);
        prompt = `A close-up photo of a vinyl record sleeve ${vinylLocation}.
The album title "${phrase}" is on the cover.
The cover art style is ${vibe}.
The sleeve has ring wear and slightly bent corners.
${realism}`;
        break;

      case "Gig Flyer":
        const gigLocation = pickRandom([
          "stapled to a telephone pole at night, shot with camera flash, tape peeling at corners",
          "pinned to a messy bulletin board in a grimy coffee shop, overlapping torn flyers and handbills",
          "wheat-pasted on a crumbling brick wall, edges torn, partially covered by newer posters"
        ]);
        prompt = `A close-up photo of a concert flyer ${gigLocation}.
The flyer promotes "${phrase}" as the band or event name.
The flyer design style is ${vibe}.
The paper is weathered, torn at the edges, with tape residue.
${realism}`;
        break;

      case "VHS Tape":
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
${realism}`;
        break;

      case "Cassette Tape":
        const cassetteLocation = pickRandom([
          "on the dashboard of an old car",
          "on a shelf with other tapes",
          "in a pile at a thrift store"
        ]);
        prompt = `A close-up photo of a commercial audio cassette tape in its plastic case ${cassetteLocation}.
The clear hinged case shows the printed J-card insert with album artwork.
The album title "${phrase}" is printed on the J-card.
The cover art style is ${vibe}.
The plastic case is slightly scratched and worn.
${realism}`;
        break;

      default:
        prompt = `A close-up photo of a vintage object labeled "${phrase}".
The design style is ${vibe}.
${realism}`;
    }

      const output = await replicate.run("ideogram-ai/ideogram-v3-quality", {
        input: {
            prompt: prompt,
            aspect_ratio: "1:1",
            style_type: "Realistic",
            magic_prompt_option: "Auto"
        }
      });

    const imageUrl = Array.isArray(output) ? output[0] : String(output);
    return NextResponse.json({ url: imageUrl });

  } catch (error) {
    console.error("Error generating image:", error);
    // @ts-ignore
    const errorMessage = error?.response?.data?.detail || error?.message || "Failed to generate";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}