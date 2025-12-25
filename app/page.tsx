"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [phrase, setPhrase] = useState("");
  const [subtitle, setSubtitle] = useState(""); // ✅ NEW STATE
  const [submitter, setSubmitter] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [vibe, setVibe] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSubmitter = localStorage.getItem("submitter");
    if (savedSubmitter) setSubmitter(savedSubmitter);
  }, []);

  const randomizeVibe = () => {
    const vibes = [
      "Cyberpunk 2077", "1980s Darkwave", "Cottagecore", "Industrial Grunge",
      "Wes Anderson Pastel", "Neon Noir", "Victorian Gothic", "Early 2000s Internet",
      "Psychedelic Rock", "Minimalist Swiss Design", "Mallsoft", "70s Punk",
    ];
    setVibe(vibes[Math.floor(Math.random() * vibes.length)]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phrase || !mediaType) return;

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
        }),
      });

      const data = await res.json();
      if (data.url) setGeneratedImage(data.url);
      else alert("Failed to generate: " + (data.error || "Unknown error"));
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      alert("Artifact copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Could not copy image automatically. Right-click and select 'Copy Image'.");
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
                placeholder="e.g. Panic at the Disco Brunch"
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
                  <option value="Autobiography">Autobiography Book</option>
                  <option value="Vinyl Record">Vinyl Record</option>
                  <option value="Gig Poster">Gig Poster</option>
                  <option value="VHS Tape">VHS Tape</option>
                  <option value="Cassette Tape">Cassette in Box</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#3d405b]">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* ✅ CONDITIONAL SUBTITLE INPUT - Only shows after Media Type when Autobiography is selected */}
            {mediaType === "Autobiography" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold uppercase mb-2 tracking-wide" style={{ fontFamily: "var(--font-body)" }}>Subtitle (Optional)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. The Dylan DiBona Story"
                  className="w-full bg-[#f4f1de] border-2 border-[#3d405b] p-3 text-lg rounded focus:outline-none focus:border-[#cc5500]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
                />
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
                  placeholder="e.g. 1980s Neon Horror"
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

            <button
              type="submit"
              disabled={isLoading || !phrase || !mediaType}
              className={`w-full py-4 text-xl uppercase tracking-wider border-2 border-[#3d405b] rounded shadow-[4px_4px_0px_0px_rgba(61,64,91,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(61,64,91,1)] transition-all ${isLoading || !phrase || !mediaType ? "bg-gray-400 cursor-not-allowed" : "bg-[#cc5500] text-white hover:bg-[#dd6611]"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.05em" }}
            >
              {isLoading ? "Developing Artifact..." : "Generate Artifact"}
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
    </main>
  );
}