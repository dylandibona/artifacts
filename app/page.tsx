"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [phrase, setPhrase] = useState("");
  const [subtitle, setSubtitle] = useState(""); // ✅ NEW STATE
  const [submitter, setSubmitter] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [vibe, setVibe] = useState("");
  const [movieGenre, setMovieGenre] = useState("Action Movie");
  const [flyerStyle, setFlyerStyle] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [modelChoice, setModelChoice] = useState<"xi" | "null" | null>(null);

  useEffect(() => {
    const savedSubmitter = localStorage.getItem("submitter");
    if (savedSubmitter) setSubmitter(savedSubmitter);
  }, []);


  const randomizeVibe = () => {
    const vibes = [
      "1970s wood-paneled basement",
      "1983 aerobics VHS",
      "Soviet propaganda poster",
      "Memphis Design fever dream",
      "Faded beach town motel",
      "1990s mall food court",
      "70s sci-fi paperback",
      "Yacht rock smooth",
      "Public access TV",
      "Trapper Keeper fantasy art",
      "Corporate synergy handbook",
      "Faded national park brochure",
      "Eastern Bloc cartoon",
      "Late night infomercial",
      "1995 CD-ROM game",
      "Brutalist architecture catalog",
      "70s occult bookstore",
      "Y2K chrome and plastic",
      "Diner placemat illustration",
      "VHS horror rental",
    ];
    setVibe(vibes[Math.floor(Math.random() * vibes.length)]);
  };

  const flyerStyleOptions = [
    { label: "60s Psychedelic (Fillmore)", value: "1960s San Francisco psychedelic concert poster with flowing Art Nouveau lettering, vibrant swirling colors, hallucinogenic imagery, and ornate borders" },
    { label: "70s Punk DIY", value: "DIY punk zine aesthetic, photocopied black and white, ransom note cut-out lettering, chaotic collage, aggressive and raw" },
    { label: "80s New Wave", value: "1980s new wave poster with bold geometric shapes, neon colors on black, angular sans-serif typography, Memphis design influence" },
    { label: "90s Deconstructed (Ray Gun era)", value: "1990s deconstructed graphic design, fragmented and layered typography, intentionally chaotic layout, grunge textures, experimental and illegible type treatments, mixed media collage" },
    { label: "Hatch Show Print", value: "vintage woodblock letterpress poster, bold slab serif typography, limited two-color palette, rustic Americana, hand-carved block print aesthetic" }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phrase || !mediaType || !modelChoice) return;

    setIsLoading(true);
    setGeneratedImage(null);

    if (submitter) localStorage.setItem("submitter", submitter);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase,
          subtitle,
          submitter,
          mediaType,
          vibe,
          movieGenre,
          flyerStyle,
          modelChoice,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setGeneratedImage(data.url);
        setShowOverlay(true);
        playSound('/sounds/microwave-timer.mp3');
      } else alert("Failed to generate: " + (data.error || "Unknown error"));
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = (soundFile: string) => {
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const copyToClipboard = async (imageUrl: string) => {
    try {
      // Use an image element + canvas to avoid CORS issues
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      alert("Artifact copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback: try native share on mobile
      if (navigator.share && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: "My Artifact",
            url: imageUrl,
          });
        } catch {
          alert("Could not copy. Long-press the image to save or share.");
        }
      } else {
        alert("Could not copy image automatically. Right-click and select 'Copy Image'.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1de] text-[#3d405b] p-4 md:p-8 flex flex-col items-center" style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-2xl w-full">
        <header className="text-center mb-12 border-b-4 border-[#3d405b] pb-6">
          <h1 className="text-5xl md:text-7xl font-bold text-[#cc5500]" style={{ fontFamily: "var(--font-heading)", textShadow: "3px 3px 0px #3d405b", letterSpacing: "0.02em" }}>
            The Artifacts
          </h1>
          <p className="mt-4 text-xl opacity-70" style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}>Archive of Non-Existent Things</p>
        </header>

        <div className="bg-[#e07a5f]/10 p-6 md:p-8 rounded-xl border-2 border-[#3d405b] shadow-[8px_8px_0px_0px_rgba(61,64,91,1)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Phrase */}
            <div>
              <label className="block text-xl font-semibold uppercase mb-2 tracking-wide" style={{ fontFamily: "var(--font-body)" }}>The Title</label>
              <textarea
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="The name of your fake band, book, or movie..."
                rows={2}
                className="w-full bg-[#f4f1de] border-2 border-[#3d405b] p-4 text-2xl focus:outline-none focus:ring-4 ring-[#cc5500] rounded-lg resize-none"
                style={{ fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.01em" }}
              />
            </div>

            {/* Media Type */}
            <div>
              <label className="block font-semibold uppercase mb-2 text-sm tracking-wide" style={{ fontFamily: "var(--font-body)" }}>Media Type</label>
              <div className="relative">
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full bg-[#f4f1de] border-2 border-[#3d405b] p-3 pr-10 rounded appearance-none focus:outline-none focus:border-[#cc5500]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
                >
                  <option value="">Choose...</option>
                  <option value="Book">Book</option>
                  <option value="Vinyl Record">Vinyl Record</option>
                  <option value="Gig Flyer">Gig Flyer</option>
                  <option value="VHS Tape">VHS Tape</option>
                  <option value="Cassette Tape">Cassette Tape</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#3d405b]">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Subtitle - Only shows for Book */}
            {mediaType === "Book" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold uppercase mb-2 tracking-wide" style={{ fontFamily: "var(--font-body)" }}>Subtitle (Optional)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional subtitle or tagline"
                  className="w-full bg-[#f4f1de] border-2 border-[#3d405b] p-3 text-lg rounded focus:outline-none focus:border-[#cc5500]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
                />
              </div>
            )}

            {/* Movie Genre - Only shows for VHS Tape */}
            {mediaType === "VHS Tape" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold uppercase mb-2 tracking-wide" style={{ fontFamily: "var(--font-body)" }}>Movie Genre</label>
                <select
                  value={movieGenre}
                  onChange={(e) => setMovieGenre(e.target.value)}
                  className="w-full bg-[#f4f1de] border-2 border-[#3d405b] p-3 text-lg rounded focus:outline-none focus:border-[#cc5500]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
                >
                  <option value="Action Movie">Action Movie</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Romantic Comedy">Romantic Comedy</option>
                  <option value="Sci-Fi B-Movie">Sci-Fi B-Movie</option>
                  <option value="Horror Film">Horror Film</option>
                  <option value="Martial Arts Movie">Martial Arts Movie</option>
                  <option value="Cop Drama">Cop Drama</option>
                  <option value="Adventure Film">Adventure Film</option>
                  <option value="Erotic Thriller">Erotic Thriller</option>
                  <option value="Slasher Film">Slasher Film</option>
                </select>
              </div>
            )}

            {/* Poster Style - Only shows for Gig Flyer */}
            {mediaType === "Gig Flyer" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold uppercase mb-2 tracking-wide" style={{ fontFamily: "var(--font-body)" }}>Poster Style</label>
                <div className="relative">
                  <select
                    value={flyerStyle}
                    onChange={(e) => setFlyerStyle(e.target.value)}
                    className="w-full bg-[#f4f1de] border-2 border-[#3d405b] p-3 pr-10 rounded appearance-none focus:outline-none focus:border-[#cc5500]"
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
                  >
                    <option value="">Select a style...</option>
                    {flyerStyleOptions.map((style) => (
                      <option key={style.label} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#3d405b]">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Vibe */}
            <div>
              <label className="block font-semibold uppercase mb-2 text-sm tracking-wide" style={{ fontFamily: "var(--font-body)" }}>The Vibe</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="Describe the design style: 1970s punk, 90s corporate, Y2K chrome..."
                  className="flex-1 bg-[#f4f1de] border-2 border-[#3d405b] p-3 rounded focus:outline-none focus:border-[#cc5500]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
                />
                <button
                  type="button"
                  onClick={randomizeVibe}
                  className="px-3 py-3 hover:bg-opacity-90 transition-colors rounded flex items-center justify-center min-w-[44px]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 600, backgroundColor: "#3d405b", color: "#f4f1de" }}
                  title="Randomize Vibe"
                >
                  <span className="text-xl">🎲</span>
                </button>
              </div>
            </div>

            {/* Model Choice Toggle */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="flex items-center gap-4 w-full justify-center">
                <button
                  type="button"
                  onClick={() => setModelChoice("xi")}
                  className={`text-sm font-semibold uppercase tracking-wide transition-all hover:opacity-100 ${modelChoice === "xi" ? "opacity-100" : "opacity-40"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Node Ξ
                </button>

                <div
                  className="toggle-track group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    if (clickX < rect.width / 2) {
                      setModelChoice("xi");
                    } else {
                      setModelChoice("null");
                    }
                  }}
                >
                  <div className="toggle-inner">
                    <div className={`toggle-knob ${
                      modelChoice === null ? "position-middle" :
                      modelChoice === "xi" ? "position-left" : "position-right"
                    }`} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModelChoice("null")}
                  className={`text-sm font-semibold uppercase tracking-wide transition-all hover:opacity-100 ${modelChoice === "null" ? "opacity-100" : "opacity-40"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Node ∅
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phrase || !mediaType || !modelChoice}
              className={`w-full py-4 text-xl uppercase tracking-wider border-2 border-[#3d405b] rounded transition-all ${isLoading ? "bg-[#2d2f45] text-[#a0a0a0] cursor-wait shadow-inner transform scale-[0.98]" : !phrase || !mediaType || !modelChoice ? "bg-gray-400 cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(61,64,91,1)]" : "bg-[#cc5500] text-white hover:bg-[#dd6611] shadow-[4px_4px_0px_0px_rgba(61,64,91,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(61,64,91,1)]"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.05em" }}
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? "Generating Artifact" : "Generate Artifact"}
                {isLoading && (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </span>
            </button>
          </form>
        </div>

        {generatedImage && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-4 border-2 border-[#3d405b] shadow-[12px_12px_0px_0px_rgba(61,64,91,0.2)] rotate-1">
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100 border border-gray-200">
                <img src={generatedImage} alt="Generated Artifact" className="w-full h-full object-cover" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 md:gap-4 justify-center">
                 <button onClick={() => handleSubmit()} className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-[#f4f1de] border-2 border-[#3d405b] text-[#3d405b] hover:bg-[#e07a5f]/20 rounded transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}><span>🔄</span> Remix</button>
                <button onClick={() => copyToClipboard(generatedImage)} className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-[#f4f1de] border-2 border-[#3d405b] text-[#3d405b] hover:bg-[#e07a5f]/20 rounded transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}><span>📋</span> Copy</button>
                <a href={generatedImage} download="artifact.jpg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-[#3d405b] text-white hover:bg-opacity-90 rounded transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}><span>⬇️</span> Download</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Polaroid Overlay */}
      {showOverlay && generatedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center"
          onClick={() => setShowOverlay(false)}
        >
          {/* Polaroid frame - tilted */}
          <div
            className="animate-eject bg-[#f5f5f0] p-3 pb-14 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-[#e5e5e0] rotate-[-2deg]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={generatedImage}
              alt="Generated artifact"
              className="animate-develop max-w-[75vw] max-h-[55vh] object-contain shadow-inner"
            />
          </div>

          {/* Action buttons */}
          <div
            className="flex gap-3 mt-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowOverlay(false);
                document.querySelector('form')?.requestSubmit();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f5f5f0] border border-[#d5d5d0] rounded shadow-sm hover:bg-[#eaeae5] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Remix
            </button>

            <button
              onClick={() => copyToClipboard(generatedImage)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f5f5f0] border border-[#d5d5d0] rounded shadow-sm hover:bg-[#eaeae5] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>

            <button
              onClick={async () => {
                try {
                  // Use canvas approach to avoid CORS issues
                  const img = new Image();
                  img.crossOrigin = "anonymous";

                  await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error("Failed to load image"));
                    img.src = generatedImage;
                  });

                  const canvas = document.createElement("canvas");
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  const ctx = canvas.getContext("2d");
                  ctx?.drawImage(img, 0, 0);

                  const url = canvas.toDataURL("image/png");
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `artifact-${Date.now()}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch (err) {
                  console.error('Failed to download:', err);
                  // Fallback: open in new tab
                  window.open(generatedImage, '_blank');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3d3d5c] text-white rounded shadow-sm hover:bg-[#4d4d6c] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>

          {/* Dismiss hint */}
          <p className="mt-4 text-white/40 text-sm">
            tap anywhere to dismiss
          </p>
        </div>
      )}
    </main>
  );
}