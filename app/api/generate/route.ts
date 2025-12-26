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

    const realism = "Shot on 35mm film with visible grain, slightly out of focus, amateur photography aesthetic.";

    let prompt = "";

    switch (mediaType) {
      case "Autobiography":
        const autobioSub = subtitle ? ` Subtitle: "${subtitle}"` : "";
        const autobioLocation = pickRandom([
          "on a table at an estate sale, price sticker visible",
          "in a thrift store bin, spine sun-faded",
          "displayed in a dusty used bookstore window"
        ]);
        prompt = `A photograph of a hardcover autobiography ${autobioLocation}.
The book titled "${phrase}" has cover art reflecting a ${vibe} aesthetic.${autobioSub}
${realism}`;
        break;

      case "Business Book":
        const bizSub = subtitle ? ` Subtitle: "${subtitle}"` : "";
        const bizLocation = pickRandom([
          "on a table at an estate sale, other books stacked nearby",
          "in a thrift store bin, spine cracked",
          "in an airport bookstore display, slightly sun-faded"
        ]);
        prompt = `A photograph of a mass-market business paperback ${bizLocation}.
The book "${phrase}" has bold confident typography and endorsement quotes on cover — the design reflects a ${vibe} aesthetic.${bizSub}
${realism}`;
        break;

      case "Vinyl Record":
        const vinylLocation = pickRandom([
          "in a thrift store record bin, other records visible",
          "in a dusty crate at a record store, ring wear on sleeve",
          "on the floor near a turntable, rolling papers nearby"
        ]);
        prompt = `A photograph of a vinyl record sleeve ${vinylLocation}.
The album "${phrase}" has cover art and typography reflecting a ${vibe} aesthetic.
${realism}`;
        break;

      case "Gig Poster":
        const gigLocation = pickRandom([
          "stapled to a telephone pole at night, shot with camera flash, tape peeling at corners",
          "pinned to a messy bulletin board in a grimy coffee shop, overlapping torn flyers and handbills",
          "wheat-pasted on a crumbling brick wall, edges torn, partially covered by newer posters"
        ]);
        prompt = `A photograph of a concert flyer ${gigLocation}.
The flyer promotes "${phrase}" — the entire poster design (colors, layout, illustration style, and typography) reflects a ${vibe} aesthetic.
${realism}`;
        break;

      case "VHS Tape":
        const vhsLocation = pickRandom([
          "on a TV stand in a cramped, messy living room",
          "in a thrift store bin with other tapes, plastic scratched",
          "in a cardboard box in a dusty attic"
        ]);
        prompt = `A photograph of a VHS tape ${vhsLocation}.
A handwritten label reads "${phrase}" in marker on the spine — the overall aesthetic feels ${vibe}.
${realism}`;
        break;

      case "Cassette Tape":
        const cassetteLocation = pickRandom([
          "on the dashboard of a beat-up old car, sun-faded",
          "in a thrift store bin, plastic case cracked",
          "in a shoebox full of tapes"
        ]);
        prompt = `A photograph of a cassette tape in its case ${cassetteLocation}.
The J-card insert shows "${phrase}" — the design reflects a ${vibe} aesthetic.
${realism}`;
        break;

      default:
        prompt = `A photograph of a vintage object labeled "${phrase}" with a ${vibe} aesthetic. ${realism}`;
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