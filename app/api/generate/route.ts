import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe } = await request.json();

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
      
      const realism = "Shot on film, natural lighting, realistic textures. NOT a digital render.";

      let prompt = "";

      switch (mediaType) {
        case "Autobiography":
            const sub = subtitle ? `The subtitle "${subtitle}" appears below the title.` : "";
            prompt = `A photograph of a hardcover book lying on a cluttered wooden desk in an academic study.
TEXT ON COVER: The title "${phrase}" is printed prominently on the dust jacket. ${sub}
The book has worn edges, a coffee ring stain nearby, reading glasses and papers visible.
DESIGN STYLE: The cover design aesthetic is ${vibe}.
${realism}`;
            break;

        case "Vinyl Record":
            prompt = `An overhead photograph of a vinyl record sleeve lying on carpet in a living room.
TEXT ON COVER: The album title "${phrase}" appears on the sleeve.
The sleeve has ring wear, soft corners, and a price sticker. A turntable is visible at the edge of frame.
DESIGN STYLE: The cover art aesthetic is ${vibe}.
${realism}`;
            break;

        case "Gig Poster":
            prompt = `A nighttime flash photograph of a concert poster stapled to a weathered telephone pole.
TEXT ON POSTER: "${phrase}" appears in bold lettering as the headline.
The paper is torn at edges, layered over older posters, held by rusty staples. Dark street behind.
DESIGN STYLE: The poster design aesthetic is ${vibe}.
${realism}`;
            break;

        case "VHS Tape":
            prompt = `A photograph of a VHS tape sitting among other tapes on a messy coffee table.
TEXT ON LABEL: A handwritten label reads "${phrase}" in black marker on the spine.
The plastic is scratched and dusty, harsh overhead lighting, a remote control visible nearby.
DESIGN STYLE: The overall aesthetic is ${vibe}.
${realism}`;
            break;

        case "Cassette Tape":
            prompt = `A flash photograph of a cassette tape case on a car dashboard.
TEXT ON J-CARD: The album title "${phrase}" is printed on the J-card insert.
The plastic case is cracked and sun-faded, car interior visible in background.
DESIGN STYLE: The J-card design aesthetic is ${vibe}.
${realism}`;
            break;

        default:
            prompt = `A photograph of a vintage object with the text "${phrase}" visible. Style: ${vibe}. ${realism}`;
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