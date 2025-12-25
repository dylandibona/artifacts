import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { phrase, subtitle, mediaType, vibe, foundAt } = await request.json();

    if (!phrase) {
      return NextResponse.json({ error: "Phrase is required" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const conditionMap: Record<string, string> = {
      "Estate Sale": "dusty, sun-faded, slightly yellowed, musty estate sale find, soft natural window light",
      "Thrift Store": "price sticker residue, shelf wear, under harsh fluorescent lighting, thrift store bin",
      "Garage Floor": "on concrete garage floor, oil stains nearby, dusty, harsh overhead shadow",
      "Attic Box": "pulled from a cardboard box, cobwebs, water stains, yellowed and forgotten",
      "Someone's Car": "on a car seat, sun-damaged, crumbs and receipts nearby, dashboard reflection"
    };
    const condition = conditionMap[foundAt] || conditionMap["Thrift Store"];

    const realism = "Shot on film, natural lighting, realistic textures. NOT a digital render.";

      let prompt = "";

      switch (mediaType) {
        case "Autobiography":
            const sub = subtitle ? `The subtitle "${subtitle}" appears below the title.` : "";
            prompt = `A photograph of a hardcover book, ${condition}.
TEXT ON COVER: The title "${phrase}" is printed prominently on the dust jacket. ${sub}
The book has worn edges, creased spine from being read.
DESIGN STYLE: The cover design aesthetic is ${vibe}.
${realism}`;
            break;

        case "Business Book":
            const bookSub = subtitle ? `The subtitle "${subtitle}" appears below the title.` : "";
            prompt = `A photograph of a mass-market business paperback book, ${condition}.
TEXT ON COVER: The title "${phrase}" in bold sans-serif font. ${bookSub} A "BESTSELLER" badge in the corner. Author photo on back cover visible.
The cover is glossy but worn, creased spine from being read, dog-eared pages visible.
DESIGN STYLE: The cover design aesthetic is ${vibe} — like a typical airport bookstore business bestseller.
${realism}`;
            break;

        case "Vinyl Record":
            prompt = `An overhead photograph of a vinyl record sleeve, ${condition}.
TEXT ON COVER: The album title "${phrase}" appears on the sleeve.
The sleeve has ring wear, soft corners, and a price sticker.
DESIGN STYLE: The cover art aesthetic is ${vibe}.
${realism}`;
            break;

        case "Gig Poster":
            prompt = `A photograph of a concert poster, ${condition}.
TEXT ON POSTER: "${phrase}" appears in bold lettering as the headline.
The paper is torn at edges, creased and weathered.
DESIGN STYLE: The poster design aesthetic is ${vibe}.
${realism}`;
            break;

        case "VHS Tape":
            prompt = `A photograph of a VHS tape, ${condition}.
TEXT ON LABEL: A handwritten label reads "${phrase}" in black marker on the spine.
The plastic is scratched and dusty.
DESIGN STYLE: The overall aesthetic is ${vibe}.
${realism}`;
            break;

        case "Cassette Tape":
            prompt = `A photograph of a cassette tape case, ${condition}.
TEXT ON J-CARD: The album title "${phrase}" is printed on the J-card insert.
The plastic case is cracked and worn.
DESIGN STYLE: The J-card design aesthetic is ${vibe}.
${realism}`;
            break;

        default:
            prompt = `A photograph of a vintage object, ${condition}. TEXT: "${phrase}" visible. Style: ${vibe}. ${realism}`;
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