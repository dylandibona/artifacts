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
          "on a table at an estate sale",
          "in a thrift store bin",
          "displayed in a bookstore window"
        ]);
        prompt = `A photograph of a mass-market business paperback ${bizLocation}.
TEXT: Title "${phrase}" in bold font.${bizSub}
DESIGN STYLE: ${vibe}. Looks like an airport bestseller.
${realism}`;
        break;

      case "Vinyl Record":
        const vinylLocation = pickRandom([
          "in a thrift store record bin",
          "in a crate at a record store",
          "on the floor of a stoner's living room near a turntable"
        ]);
        prompt = `A photograph of a vinyl record sleeve ${vinylLocation}.
TEXT: Album title "${phrase}" on the cover.
DESIGN STYLE: ${vibe}.
${realism}`;
        break;

      case "Gig Poster":
        const gigLocation = pickRandom([
          "stapled to a telephone pole at night, flash photography",
          "on a crowded bulletin board with other flyers",
          "wheat-pasted on a brick wall in an alley"
        ]);
        prompt = `A photograph of a concert poster ${gigLocation}.
TEXT: "${phrase}" as the headline.
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