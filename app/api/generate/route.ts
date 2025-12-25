import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe: rawVibe } = await request.json();
    const vibe = rawVibe ? rawVibe.replace(/,\s*/g, " and ") : "";

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const realism = "Photograph shot on 35mm film. Realistic.";

    let prompt = "";

    switch (mediaType) {
      case "Autobiography":
        const autobioSub = subtitle ? ` Subtitle: "${subtitle}"` : "";
        const autobioLocation = pickRandom([
          "on a table at an estate sale",
          "in a thrift store bin",
          "displayed in a dusty bookstore window"
        ]);
        prompt = `A photograph of a hardcover autobiography ${autobioLocation}.
TEXT: Title "${phrase}" on the cover.${autobioSub}
DESIGN STYLE: ${vibe}.
${realism}`;
        break;

      case "Business Book":
        const bizSub = subtitle ? ` Subtitle: "${subtitle}"` : "";
        const bizLocation = pickRandom([
          "on a table at an estate sale, other books stacked nearby",
          "in a thrift store bin, spine cracked",
          "in a bookstore window display, slightly sun-faded"
        ]);
        prompt = `A photograph of a paperback business book ${bizLocation}.
TEXT: Title "${phrase}" in bold, confident lettering.${bizSub}
DESIGN STYLE: ${vibe}. Typical airport bookstore bestseller with endorsement quotes on cover.
${realism}`;
        break;

      case "Vinyl Record":
        const vinylLocation = pickRandom([
          "in a thrift store record bin, other records visible",
          "in a dusty crate at a record store",
          "on the floor near a turntable, rolling papers nearby"
        ]);
        prompt = `A photograph of a vinyl record sleeve ${vinylLocation}.
TEXT: Album title "${phrase}" in typography that fits a ${vibe} aesthetic.
DESIGN STYLE: ${vibe}.
${realism}`;
        break;

      case "Gig Poster":
        const gigLocation = pickRandom([
          "stapled to a telephone pole at night, shot with flash, tape peeling",
          "pinned to a chaotic bulletin board in a grimy coffee shop, overlapping other flyers, torn corners, coffee stains",
          "wheat-pasted on a crumbling brick wall, partially covered by newer posters"
        ]);
        prompt = `A photograph of a concert poster ${gigLocation}.
TEXT: "${phrase}" as the headline in typography that matches a ${vibe} aesthetic.
DESIGN STYLE: ${vibe}.
${realism}`;
        break;

      case "VHS Tape":
        const vhsLocation = pickRandom([
          "on a TV stand in a cramped, messy living room",
          "in a thrift store bin with other tapes",
          "in a cardboard box in an attic"
        ]);
        prompt = `A photograph of a VHS tape ${vhsLocation}.
TEXT: Handwritten label reads "${phrase}" in marker.
DESIGN STYLE: ${vibe}.
${realism}`;
        break;

      case "Cassette Tape":
        const cassetteLocation = pickRandom([
          "on the dashboard of a beat-up old car",
          "in a thrift store bin",
          "in a shoebox full of tapes"
        ]);
        prompt = `A photograph of a cassette tape in its case ${cassetteLocation}.
TEXT: "${phrase}" printed on the J-card insert.
DESIGN STYLE: ${vibe}.
${realism}`;
        break;

      default:
        prompt = `A photograph of a vintage object. TEXT: "${phrase}". STYLE: ${vibe}. ${realism}`;
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