import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe, decade } = await request.json();

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
      
      const realism = "Style: Raw amateur photography, realistic texture, film grain, unedited. NOT a render.";
      
      let prompt = "";
      
      switch (mediaType) {
        case "Autobiography":
            const sub = subtitle ? `The subtitle "${subtitle}" appears below the title.` : "";
            prompt = `A photograph of a hardcover autobiography lying on a cluttered desk in a ${decade} academic study.
                Dust jacket with worn edges, coffee ring stain nearby.
                The title "${phrase}" is printed on the cover in period-appropriate typography.
                ${sub}
                The cover design aesthetic is ${vibe}.
                Stacks of papers, reading glasses, and a desk lamp visible in the background.
                ${realism}`;
            break;

        case "Vinyl Record":
            prompt = `An overhead photograph of a vinyl record sleeve lying on shag carpet in a ${decade} living room.
                The album "${phrase}" with cover art in the style of ${vibe}.
                The sleeve has ring wear, soft corners, and a used record store price sticker.
                A turntable and scattered records visible at the edge of frame.
                ${realism}`;
            break;

        case "Gig Poster":
            prompt = `A nighttime flash photograph of a wheat-pasted concert poster on a weathered telephone pole.
                The poster announces "${phrase}" in bold lettering, designed in ${vibe} style typical of ${decade} punk and rock flyers.
                The paper is torn, layered over older posters, held by rusty staples.
                A dark street scene behind, shot like amateur street photography.
                ${realism}`;
            break;

        case "VHS Tape":
            prompt = `A photograph of a black VHS tape sitting on a cluttered coffee table in a messy ${decade} living room.
                A handwritten label on the spine reads "${phrase}" in sharpie.
                The tape is dusty, the plastic scratched from years of use.
                The aesthetic is ${vibe}.
                Other tapes, a remote control, and an ashtray visible nearby. Harsh overhead lighting.
                ${realism}`;
            break;

        case "Cassette Tape":
            prompt = `A flash photograph of a cassette tape case on the dashboard of a beat-up ${decade} car.
                The J-card insert shows "${phrase}" as the album title, designed in ${vibe} style.
                The plastic case is cracked and sun-faded.
                Fuzzy dice or air freshener hanging from the rearview mirror, cracked vinyl seats visible.
                ${realism}`;
            break;

        default:
            prompt = `A raw photograph of a worn ${decade} artifact labeled "${phrase}" in a lived-in setting. Style: ${vibe}. ${realism}`;
      }

      const output = await replicate.run("google/imagen-4", {
        input: {
            prompt: prompt,
            aspect_ratio: "1:1"
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