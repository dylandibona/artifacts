"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [phrase, setPhrase] = useState("");
  const [subtitle, setSubtitle] = useState(""); // ✅ NEW STATE
  const [submitter, setSubmitter] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [vibe, setVibe] = useState("");
  const [movieGenre, setMovieGenre] = useState("Action Movie");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          movieGenre,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setGeneratedImage(data.url);
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

            <button
              type="submit"
              disabled={isLoading || !phrase || !mediaType}
              className={`w-full py-4 text-xl uppercase tracking-wider border-2 border-[#3d405b] rounded transition-all ${isLoading ? "bg-[#2d2f45] text-[#a0a0a0] cursor-wait shadow-inner transform scale-[0.98]" : !phrase || !mediaType ? "bg-gray-400 cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(61,64,91,1)]" : "bg-[#cc5500] text-white hover:bg-[#dd6611] shadow-[4px_4px_0px_0px_rgba(61,64,91,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(61,64,91,1)]"}`}
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
    </main>
  );
}