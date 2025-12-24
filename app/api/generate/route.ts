import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe } = await request.json();

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
      
      const realism = "Style: Raw amateur photography, realistic texture, film grain, unedited. NOT a render.";
      
      let prompt = "";
      
      switch (mediaType) {
        case "Autobiography":
            const sub = subtitle ? `Subtitle "${subtitle}" is printed below.` : "";
            prompt = `A close-up, slightly high-angle photo of a vintage hardcover autobiography lying on a cluttered desk. 
            The book has a dust jacket with worn, white edges. 
            The title "${phrase}" is printed on the cover in the style of vintage hardcover classics. 
            ${sub} 
            The aesthetic is ${vibe}. 
            Background: a busy academic study. 
            ${realism}`;
            break;

        case "Vinyl Record":
            prompt = `A vintage photography, taken directly overhead, of a vinyl record album sleeve lying on a 1970s carpet. 
            The album title "${phrase}" is creatively integrated into the cover art. 
            The cover art style is ${vibe}. 
            The record sleeve looks used, with visible ring wear (circular fade) and scuffed cardboard corners. 
            A neon price tag sticker is in one of the corners. 
            ${realism}`;
            break;

        case "Gig Poster":
            prompt = `A nighttime flash photo of a concert flyer stapled to a weathered wooden telephone pole. 
            The poster announces the band "${phrase}" in bold lettering. 
            The poster art style is ${vibe}. 
            The paper is wrinkled, weathered, and has a tear at the bottom. 
            A rusty staple holds it up. 
            Street photography style. 
            ${realism}`;
            break;

        case "VHS Tape":
            prompt = `A close-up shot of a black VHS cassette tape sitting in a stack of other tapes. 
            A white paper label on the spine has the handwritten text "${phrase}" written in black sharpie marker. 
            The aesthetic is ${vibe}. 
            The plastic is scratched and dusty. 
            Harsh overhead lighting. 
            The setting is the grimy coffee table of a shut-in. 
            ${realism}`;
            break;

        case "Cassette Tape":
            prompt = `A close-up flash photograph of a 1980s cassette tape case sitting in the interior of a 1980s car. 
            The paper J-card insert has the title "${phrase}" printed in bold ${vibe} typography. 
            The aesthetic is ${vibe}. 
            The plastic case is heavily scuffed, scratched, and has a small crack in the corner. 
            Harsh flash reflections on the plastic surface. 
            ${realism}`;
            break;

        default:
            prompt = `A raw photo of a physical object labeled "${phrase}". Style: ${vibe}. ${realism}`;
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