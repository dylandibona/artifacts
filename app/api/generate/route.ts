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
            const sub = subtitle ? `Subtitle "${subtitle}" is printed below the title.` : "";
            prompt = `A photograph of a hardcover autobiography from the ${decade} on a wooden desk.
                The book has a dust jacket with worn edges.
                The title "${phrase}" is printed prominently on the cover.
                ${sub}
                The aesthetic is ${vibe}.
                ${realism}`;
            break;

        case "Vinyl Record":
            prompt = `A photograph taken from above of a vinyl record sleeve on a carpeted floor.
                The album title "${phrase}" is displayed on the cover art.
                The cover art style is ${vibe}, reflecting ${decade} graphic design.
                The sleeve shows ring wear and scuffed corners. A price sticker is visible.
                ${realism}`;
            break;

        case "Gig Poster":
            prompt = `A nighttime flash photograph of a concert poster stapled to a telephone pole.
                The poster advertises "${phrase}" in bold lettering.
                The design style is ${vibe}, typical of ${decade} concert flyers.
                The paper is weathered with tears and rusty staples.
                ${realism}`;
            break;

        case "VHS Tape":
            prompt = `A photograph of a VHS tape among a stack of tapes on a coffee table.
                A handwritten label reads "${phrase}" in marker.
                The aesthetic is ${vibe}.
                The plastic is scratched and dusty. Shot in ${decade}.
                ${realism}`;
            break;

        case "Cassette Tape":
            prompt = `A flash photograph of a cassette tape case on a car dashboard.
                The J-card insert displays "${phrase}" as the album title.
                The design style is ${vibe}, reflecting ${decade} aesthetics.
                The plastic case is scuffed with a cracked corner.
                ${realism}`;
            break;

        default:
            prompt = `A photograph of a ${decade} artifact labeled "${phrase}". Style: ${vibe}. ${realism}`;
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